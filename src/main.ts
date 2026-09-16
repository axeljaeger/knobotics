import { mount } from "svelte";
import "./app.css";
import "./chrome.css";
import App from "./App.svelte";

const target = document.getElementById("app");

if (!target) throw new Error("The app mount element is missing.");

const app = mount(App, { target });

export default app;
