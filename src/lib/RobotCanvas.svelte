<script lang="ts">
import {
	base,
	jointColors,
	jointNames,
	pointsFor,
	thetaFor,
	type Point,
} from "./robot";

let {
	angles,
	crosshair,
	selectedJoint,
	onSelectJoint,
	onNudgeJoint,
	onSetCrosshair,
	onMoveGripper,
	onRotateGripper,
}: {
	angles: number[];
	crosshair: Point;
	selectedJoint: number | null;
	onSelectJoint: (index: number) => void;
	onNudgeJoint: (index: number, direction: number) => void;
	onSetCrosshair: (point: Point) => void;
	onMoveGripper: (point: Point) => void;
	onRotateGripper: (direction: number) => void;
} = $props();

let dragging = $state(false);
const points = $derived(pointsFor(angles));
const endEffector = $derived(points[3]);
const endTheta = $derived(thetaFor(angles));

function pointFromEvent(event: PointerEvent): Point {
	const element = (event.currentTarget as Element).closest(
		"svg",
	) as SVGSVGElement;
	const bounds = element.getBoundingClientRect();
	const scale = Math.min(bounds.width / 430, bounds.height / 390);
	const verticalOffset = (bounds.height - 390 * scale) / 2;
	return {
		x: (event.clientX - bounds.left) / scale,
		y: (event.clientY - bounds.top - verticalOffset) / scale,
	};
}

function updateCrosshair(event: PointerEvent) {
	onSetCrosshair(pointFromEvent(event));
}

function startGripperDrag(event: PointerEvent) {
	event.preventDefault();
	event.stopPropagation();
	dragging = true;
	onMoveGripper(pointFromEvent(event));
}

function moveGripper(event: PointerEvent) {
	if (dragging) onMoveGripper(pointFromEvent(event));
}
</script>

<div class="arm-panel">
	<svg
		class="arm-stage"
		viewBox="0 0 430 390"
		preserveAspectRatio="xMinYMid meet"
		role="img"
		aria-label="Interactive three-joint robot arm"
		onpointerdown={updateCrosshair}
		onpointermove={moveGripper}
		onpointerup={() => (dragging = false)}
		onpointerleave={() => (dragging = false)}
	>
		<defs>
			<linearGradient
				id="arm"
				gradientUnits="userSpaceOnUse"
				x1="0"
				y1="40"
				x2="430"
				y2="350"
			>
				<stop stop-color="#213546" />
				<stop offset="1" stop-color="#58778a" />
			</linearGradient>
		</defs>
		<g class="target">
			<circle cx={crosshair.x} cy={crosshair.y} r="15" />
			<path
				d={`M ${crosshair.x - 24} ${crosshair.y}h48M ${crosshair.x} ${crosshair.y - 24}v48`}
			/>
			<circle cx={crosshair.x} cy={crosshair.y} r="4" />
		</g>
		<g>
			{#each [0, 1, 2] as index}
				<line
					class="arm-link"
					x1={points[index].x}
					y1={points[index].y}
					x2={points[index + 1].x}
					y2={points[index + 1].y}
				/>
			{/each}
		</g>
		<circle class="base-shadow" cx={base.x} cy={base.y + 17} r="39" />
		<path
			class="base-plate"
			d={`M ${base.x - 48} ${base.y + 16} Q ${base.x} ${base.y - 5} ${base.x + 48} ${base.y + 16} L ${base.x + 41} ${base.y + 34} L ${base.x - 41} ${base.y + 34}Z`}
		/>
		{#each [0, 1, 2] as index}
			<g
				class:selected={selectedJoint === index}
				class="joint"
				style={`--joint:${jointColors[index]}`}
			>
				{#if selectedJoint === index}
					<circle
						class="selection-outline"
						cx={points[index].x}
						cy={points[index].y}
						r="25"
					/>
				{/if}
				<circle
					class="joint-halo"
					cx={points[index].x}
					cy={points[index].y}
					r="27"
				/>
				<circle
					class="joint-ring"
					cx={points[index].x}
					cy={points[index].y}
					r="17"
					role="button"
					tabindex="0"
					aria-label={`Bind MIDI controller to ${jointNames[index]} joint`}
					onclick={(event) => {
						event.stopPropagation()
						onSelectJoint(index)
					}}
					onkeydown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault()
							onSelectJoint(index)
						}
					}}
					onwheel={(event) => {
						event.preventDefault()
						event.stopPropagation()
						onNudgeJoint(index, event.deltaY < 0 ? 1 : -1)
					}}
				/>
				<circle
					class="joint-core"
					cx={points[index].x}
					cy={points[index].y}
					r="7"
				/>
				<text
					x={points[index].x}
					y={points[index].y}
					dominant-baseline="middle"
				>
					{index + 1}
				</text>
			</g>
		{/each}
		<g
			class="gripper"
			role="button"
			tabindex="0"
			aria-label="Drag gripper to move the arm"
			transform={`translate(${endEffector.x}, ${endEffector.y}) rotate(${endTheta})`}
			onpointerdown={startGripperDrag}
			onwheel={(event) => {
				event.preventDefault()
				event.stopPropagation()
				onRotateGripper(event.deltaY < 0 ? 1 : -1)
			}}
		>
			<circle r="11" />
			<path d="M 7 -8 L 25 -20 L 31 -13 L 15 -3 M 7 8 L 25 20 L 31 13 L 15 3" />
		</g>
	</svg>
</div>
