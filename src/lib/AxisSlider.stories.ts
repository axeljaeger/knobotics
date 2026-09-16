import type { Meta, StoryObj } from "@storybook/svelte-vite";
import AxisSlider from "./AxisSlider.svelte";

const noop = () => {};

const meta = {
	title: "Controls/Axis Slider",
	component: AxisSlider,
	args: {
		onSelect: noop,
		onValueChange: noop,
		onNudge: noop,
	},
	decorators: [
		(Story) => ({
			Component: Story,
			props: {},
		}),
	],
} satisfies Meta<typeof AxisSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Joint: Story = {
	args: {
		label: "Shoulder",
		value: -40,
		min: -150,
		max: 150,
		binding: { channel: 1, cc: 16 },
		selected: true,
		color: "#ff715b",
		index: 0,
	},
};

export const World: Story = {
	args: {
		label: "X",
		value: 125,
		min: -200,
		max: 200,
		binding: null,
		world: true,
	},
};

export const WithoutMidi: Story = {
	args: {
		label: "Wrist",
		value: 70,
		min: -170,
		max: 170,
		binding: { channel: 1, cc: 18 },
		color: "#f6c453",
		index: 2,
		midiSupported: false,
	},
};
