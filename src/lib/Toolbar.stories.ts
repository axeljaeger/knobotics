import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Toolbar from "./Toolbar.svelte";

const meta = {
	title: "Controls/Toolbar",
	component: Toolbar,
	args: {
		onReset: () => {},
		onSync: () => {},
		onConnect: () => {},
		midiSupported: true,
	},
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutMidi: Story = {
	args: { midiSupported: false },
};
