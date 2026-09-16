<script lang="ts">
import { onMount } from "svelte";
import AxisSlider from "./lib/AxisSlider.svelte";
import RobotCanvas from "./lib/RobotCanvas.svelte";
import Toolbar from "./lib/Toolbar.svelte";
import {
	base,
	clamp,
	jointColors,
	jointLimits,
	jointNames,
	lengths,
	pointsFor,
	radians,
	thetaFor,
	worldLimits,
	type Binding,
	type Point,
	type WorldAxis,
} from "./lib/robot";

const initialAngles = [-40, 90, 70];
const worldAxes: { label: string; axis: WorldAxis }[] = [
	{ label: "X", axis: "x" },
	{ label: "Y", axis: "y" },
	{ label: "θ", axis: "theta" },
];
let angles = $state([...initialAngles]);
let bindings = $state<Binding[]>([null, null, null]);
let worldBindings = $state<Binding[]>([null, null, null]);
let selectedJoint = $state<number | null>(null);
let selectedWorld = $state<number | null>(null);
let midiAccess = $state<MIDIAccess | null>(null);
let target = $state<Point>({ x: 340, y: 154 });
let crosshair = $state<Point>({ x: 340, y: 154 });
let targetTheta = $state(thetaFor(initialAngles));
let midiSupported = $state(false);

function setAngle(index: number, value: number) {
	const limit = jointLimits[index];
	const nextAngles = angles.map((angle, currentIndex) =>
		currentIndex === index ? clamp(value, limit.min, limit.max) : angle,
	);
	angles = nextAngles;
	target = pointsFor(nextAngles)[3];
	targetTheta = thetaFor(nextAngles);
}
function nudgeJoint(index: number, direction: number) {
	setAngle(index, angles[index] + direction * 3);
}
function selectJoint(index: number) {
	selectedJoint = index;
	selectedWorld = null;
}
function selectWorld(index: number) {
	selectedWorld = index;
	selectedJoint = null;
}
function clearBinding(index: number) {
	bindings = bindings.map((binding, currentIndex) =>
		currentIndex === index ? null : binding,
	);
}

function solveIK() {
	const theta = radians(targetTheta);
	const wrist = {
		x: target.x - lengths[2] * Math.cos(theta),
		y: target.y - lengths[2] * Math.sin(theta),
	};
	const dx = wrist.x - base.x,
		dy = wrist.y - base.y;
	const [l1, l2] = lengths;
	const distance = clamp(
		Math.hypot(dx, dy),
		Math.abs(l1 - l2) + 0.001,
		l1 + l2 - 0.001,
	);
	const elbowMagnitude = Math.acos(
		clamp((distance ** 2 - l1 ** 2 - l2 ** 2) / (2 * l1 * l2), -1, 1),
	);
	const candidates = [elbowMagnitude, -elbowMagnitude].map((elbow) => {
		const shoulder =
			Math.atan2(dy, dx) -
			Math.atan2(l2 * Math.sin(elbow), l1 + l2 * Math.cos(elbow));
		return [(shoulder * 180) / Math.PI + 90, (elbow * 180) / Math.PI];
	});
	const pair = candidates.sort(
		(a, b) =>
			Math.abs(a[0] - angles[0]) +
			Math.abs(a[1] - angles[1]) -
			Math.abs(b[0] - angles[0]) -
			Math.abs(b[1] - angles[1]),
	)[0];
	const nextAngles = [
		clamp(pair[0], jointLimits[0].min, jointLimits[0].max),
		clamp(pair[1], jointLimits[1].min, jointLimits[1].max),
		0,
	];
	nextAngles[2] = clamp(
		targetTheta - (-90 + nextAngles[0] + nextAngles[1]),
		jointLimits[2].min,
		jointLimits[2].max,
	);
	angles = nextAngles;
}
function setWorld(axis: WorldAxis, value: number) {
	if (axis === "x") target = { ...target, x: base.x + value };
	else if (axis === "y") target = { ...target, y: base.y - value };
	else targetTheta = value;
	solveIK();
}
function setCrosshair(point: Point) {
	crosshair = { x: clamp(point.x, 20, 410), y: clamp(point.y, 20, 355) };
}
function moveGripper(point: Point) {
	target = { x: clamp(point.x, 20, 410), y: clamp(point.y, 20, 355) };
	solveIK();
}
function syncCrosshair() {
	target = { ...crosshair };
	solveIK();
}
function resetArm() {
	angles = [...initialAngles];
	target = pointsFor(initialAngles)[3];
	crosshair = { ...target };
	targetTheta = thetaFor(initialAngles);
}

function handleMidiMessage(event: MIDIMessageEvent) {
	const data = event.data;
	if (!data) return;
	const [status, cc, value] = data;
	if ((status & 0xf0) !== 0xb0 || cc === undefined || value === undefined)
		return;
	const binding = { channel: (status & 0x0f) + 1, cc };
	const matchingJoint = bindings.findIndex(
		(item) => item?.channel === binding.channel && item?.cc === binding.cc,
	);
	const matchingWorld = worldBindings.findIndex(
		(item) => item?.channel === binding.channel && item?.cc === binding.cc,
	);
	if (selectedJoint !== null) {
		const index = selectedJoint;
		bindings = bindings.map((item, currentIndex) =>
			currentIndex === index ? binding : item,
		);
		selectedJoint = null;
		const limit = jointLimits[index];
		setAngle(index, limit.min + (value / 127) * (limit.max - limit.min));
		return;
	}
	if (selectedWorld !== null) {
		const index = selectedWorld;
		worldBindings = worldBindings.map((item, currentIndex) =>
			currentIndex === index ? binding : item,
		);
		selectedWorld = null;
		const limit = worldLimits[index];
		setWorld(
			worldAxes[index].axis,
			limit.min + (value / 127) * (limit.max - limit.min),
		);
		return;
	}
	if (matchingJoint >= 0) {
		const limit = jointLimits[matchingJoint];
		setAngle(
			matchingJoint,
			limit.min + (value / 127) * (limit.max - limit.min),
		);
	}
	if (matchingWorld >= 0) {
		const limit = worldLimits[matchingWorld];
		setWorld(
			worldAxes[matchingWorld].axis,
			limit.min + (value / 127) * (limit.max - limit.min),
		);
	}
}
async function connectMidi() {
	if (!navigator.requestMIDIAccess) return;
	try {
		midiAccess = await navigator.requestMIDIAccess();
		const attachInputs = () => {
			for (const input of midiAccess?.inputs.values() ?? [])
				input.onmidimessage = handleMidiMessage;
		};
		attachInputs();
		midiAccess.onstatechange = attachInputs;
	} catch {
		/* Pointer controls remain available. */
	}
}
onMount(() => {
	midiSupported = "requestMIDIAccess" in navigator;
	return () => {
		if (midiAccess) midiAccess.onstatechange = null;
	};
});
</script>

<svelte:head
	><title>Knobotics — MIDI robot arm</title>
	<meta
		name="description"
		content="Explore planar robot arm kinematics with MIDI knobs."
	></svelte:head
>

<main>
	<section class="workbench">
		<RobotCanvas
			{angles}
			{crosshair}
			{selectedJoint}
			onSelectJoint={selectJoint}
			onNudgeJoint={nudgeJoint}
			onSetCrosshair={setCrosshair}
			onMoveGripper={moveGripper}
			onRotateGripper={(direction) => setWorld("theta", targetTheta + direction * 3)}
		/>
		<Toolbar
			{midiSupported}
			onReset={resetArm}
			onSync={syncCrosshair}
			onConnect={connectMidi}
		/>
		<aside class="control-panel">
			<details class="control-section" open>
				<summary>Joint space</summary>
				<div class="joint-list">
					{#each angles as angle, index}
						<AxisSlider
							label={jointNames[index]}
							value={angle}
							min={jointLimits[index].min}
							max={jointLimits[index].max}
							binding={bindings[index]}
							selected={selectedJoint === index}
							color={jointColors[index]}
							{index}
							onSelect={() => selectJoint(index)}
							onValueChange={(value) => setAngle(index, value)}
							onNudge={(direction) => nudgeJoint(index, direction)}
							onUnbind={() => clearBinding(index)}
							{midiSupported}
						/>
					{/each}
				</div>
			</details>
			<details class="control-section" open>
				<summary>World space</summary>
				<div class="world-list">
					{#each worldAxes as worldAxis, index}
						<AxisSlider
							label={worldAxis.label}
							value={index === 0 ? target.x - base.x : index === 1 ? base.y - target.y : targetTheta}
							min={worldLimits[index].min}
							max={worldLimits[index].max}
							binding={worldBindings[index]}
							world
							onSelect={() => selectWorld(index)}
							onValueChange={(value) => setWorld(worldAxis.axis, value)}
							onNudge={(direction) => setWorld(worldAxis.axis, (index === 0 ? target.x - base.x : index === 1 ? base.y - target.y : targetTheta) + direction * 3)}
							onWheel={index === 2 ? (event) => { event.preventDefault(); setWorld("theta", targetTheta + (event.deltaY < 0 ? 3 : -3)) } : undefined}
							{midiSupported}
						/>
					{/each}
				</div>
			</details>
		</aside>
	</section>
</main>
