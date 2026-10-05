<!--
	@component
	System / Light / Dark, as a segmented control of native radios.
-->
<script lang="ts">
	import Icon, { type IconName } from '#lib/components/Icon.svelte';
	import { setTheme, theme, type ThemeChoice } from '#lib/theme.svelte.js';

	interface Props {
		/** Show the words next to the icons (the mobile menu has room). */
		labels?: boolean;
	}

	let { labels = false }: Props = $props();

	const name = $props.id();

	const OPTIONS: { value: ThemeChoice; label: string; icon: IconName }[] = [
		{ value: 'system', label: 'System', icon: 'system' },
		{ value: 'light', label: 'Light', icon: 'sun' },
		{ value: 'dark', label: 'Dark', icon: 'moon' }
	];
</script>

<fieldset class="flex rounded-full bg-white/12 p-1 text-on-chrome-muted">
	<legend class="sr-only">Colour theme</legend>
	{#each OPTIONS as option (option.value)}
		<label
			title={option.label}
			class={[
				'relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full transition-colors duration-150',
				'hover:text-white has-checked:bg-white has-checked:text-royal',
				'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-white',
				labels ? 'h-10 px-4 text-sm font-semibold' : 'size-8'
			]}
		>
			<input
				type="radio"
				{name}
				value={option.value}
				checked={theme.choice === option.value}
				onchange={() => setTheme(option.value)}
				class="sr-only"
			/>
			<Icon name={option.icon} class="size-4" />
			<span class={labels ? undefined : 'sr-only'}>{option.label}</span>
		</label>
	{/each}
</fieldset>
