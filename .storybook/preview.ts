import "../src/app.css";
import "../src/chrome.css";

import type { Preview } from "@storybook/svelte-vite";

const preview: Preview = {
	parameters: {
		layout: "fullscreen",
		controls: { expanded: true },
	},
};

export default preview;
