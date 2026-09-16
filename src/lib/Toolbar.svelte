<script lang="ts">
let {
	onReset,
	onSync,
	onConnect,
	midiSupported,
}: {
	onReset: () => void;
	onSync: () => void;
	onConnect: () => void;
	midiSupported: boolean;
} = $props();
</script>

<header class="masthead">
	<div class="brand-stack">
		<div class="brand">KNOBOTICS</div>
		<a href="https://github.com/" target="_blank" rel="noreferrer"
			>GitHub ↗ <span>v0.1.0</span></a
		>
	</div>
	<div class="toolbar" role="group" aria-label="Robot controls">
		<button
			type="button"
			aria-label="Reset pose"
			title="Reset pose"
			onclick={onReset}
		>
			<span class="material-symbols-rounded">restart_alt</span>
		</button>
		<button
			type="button"
			aria-label="Sync crosshair"
			title="Sync crosshair"
			onclick={onSync}
		>
			<span class="material-symbols-rounded">my_location</span>
		</button>
		{#if midiSupported}
			<button
				type="button"
				class="midi-button"
				aria-label="Connect MIDI"
				title="Connect MIDI controller"
				onclick={onConnect}
			>
				<span class="material-symbols-rounded">cable</span>
			</button>
		{/if}
	</div>
</header>
