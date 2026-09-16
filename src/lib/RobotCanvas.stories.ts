import type { Meta, StoryObj } from "@storybook/svelte-vite";
import RobotCanvas from "./RobotCanvas.svelte";

const meta = {
	title: "Robot/Canvas",
	component: RobotCanvas,
	args: {
		angles: [-40, 90, 70],
		crosshair: { x: 340, y: 154 },
		selectedJoint: 1,
		onSelectJoint: () => {},
		onNudgeJoint: () => {},
		onSetCrosshair: () => {},
		onMoveGripper: () => {},
		onRotateGripper: () => {},
	},
} satisfies Meta<typeof RobotCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ExtendedPose: Story = {
	args: {
		angles: [-15, 45, 35],
		selectedJoint: null,
	},
};
