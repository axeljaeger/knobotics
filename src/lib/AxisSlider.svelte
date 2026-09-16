<script lang="ts">
import { bindingLabel, type Binding } from "./robot";

let {
	label,
	value,
	min,
	max,
	binding,
	selected = false,
	color,
	index,
	world = false,
	onSelect,
	onValueChange,
	onNudge,
	onUnbind,
	onWheel,
	midiSupported = true,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	binding: Binding;
	selected?: boolean;
	color?: string;
	index?: number;
	world?: boolean;
	onSelect: () => void;
	onValueChange: (value: number) => void;
	onNudge: (direction: number) => void;
	onUnbind?: () => void;
	onWheel?: (event: WheelEvent) => void;
	midiSupported?: boolean;
} = $props();

const displayValue = $derived(
	`${Math.round(value)}${world && label === "θ" ? "°" : world ? "" : "°"}`,
);

function handleWheel(event: WheelEvent) {
	if (onWheel) onWheel(event);
}
</script>

<article
	class="joint-card"
	class:world-card={world}
	class:selected-card={selected}
	onwheel={handleWheel}
>
	<button
		type="button"
		class="joint-select"
		class:world-select={world}
		onclick={onSelect}
		aria-pressed={selected}
		aria-label={midiSupported ? `Select ${label} for MIDI mapping` : label}
	>
		{#if !world && color && index !== undefined}
			<span class="joint-number" style={`--joint:${color}`}>{index + 1}</span>
		{/if}
		<span>
			<strong>{label}</strong>
			{#if midiSupported}
				<small>{bindingLabel(binding)}</small>
			{/if}
		</span>
		<span class="angle">{displayValue}</span>
	</button>
	<div class="angle-control">
		<button
			type="button"
			aria-label={`Decrease ${label}`}
			onclick={() => onNudge(-1)}
		>
			−
		</button>
		<input
			aria-label={`${label} value`}
			type="range"
			{min}
			{max}
			{value}
			oninput={(event) => onValueChange(Number(event.currentTarget.value))}
		>
		<button
			type="button"
			aria-label={`Increase ${label}`}
			onclick={() => onNudge(1)}
		>
			+
		</button>
	</div>
	{#if midiSupported && binding && onUnbind}
		<button type="button" class="unbind" onclick={onUnbind}>Unbind</button>
	{/if}
</article>
