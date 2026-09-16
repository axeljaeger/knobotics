export type Binding = { channel: number; cc: number } | null;
export type Point = { x: number; y: number };
export type WorldAxis = "x" | "y" | "theta";

export const base: Point = { x: 215, y: 322 };
export const lengths = [132, 110, 48];
export const jointLimits = [
	{ min: -150, max: 150 },
	{ min: -145, max: 145 },
	{ min: -170, max: 170 },
];
export const worldLimits = [
	{ min: -200, max: 200 },
	{ min: -200, max: 300 },
	{ min: -180, max: 180 },
];
export const jointNames = ["Shoulder", "Elbow", "Wrist"];
export const jointColors = ["#ff715b", "#65c2a5", "#f6c453"];

export const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));
export const radians = (degrees: number) => (degrees * Math.PI) / 180;

export function pointsFor(angles: number[]): Point[] {
	const points = [base];
	let cumulativeAngle = -90;
	let previous = base;

	angles.forEach((angle, index) => {
		cumulativeAngle += angle;
		previous = {
			x: previous.x + lengths[index] * Math.cos(radians(cumulativeAngle)),
			y: previous.y + lengths[index] * Math.sin(radians(cumulativeAngle)),
		};
		points.push(previous);
	});

	return points;
}

export const thetaFor = (angles: number[]) =>
	angles.reduce((sum, angle) => sum + angle, -90);
export const bindingLabel = (binding: Binding) =>
	binding ? `Ch ${binding.channel} · CC ${binding.cc}` : "Unbound";
