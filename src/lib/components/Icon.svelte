<!--
	@component
	The site's icons, drawn on a 24px grid. Decorative: label the control that contains them.
-->
<script lang="ts" module>
	const ICONS = {
		play: '<path fill="currentColor" stroke="none" d="M8 5.6v12.8a1 1 0 0 0 1.53.85l10.2-6.4a1 1 0 0 0 0-1.7L9.53 4.75A1 1 0 0 0 8 5.6Z"/>',
		pause:
			'<rect fill="currentColor" stroke="none" x="6.5" y="5" width="4" height="14" rx="1"/><rect fill="currentColor" stroke="none" x="13.5" y="5" width="4" height="14" rx="1"/>',
		close: '<path d="M6 6l12 12M18 6 6 18"/>',
		external: '<path d="M8 16 16 8M9.5 8H16v6.5"/>',
		arrow: '<path d="M5 12h13M13 6.5 18.5 12 13 17.5"/>',
		back: '<path d="M19 12H6M11 6.5 5.5 12l5.5 5.5"/>',
		chevron: '<path d="m9.5 6.5 5.5 5.5-5.5 5.5"/>',
		search: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>',
		check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
		system:
			'<circle cx="12" cy="12" r="8"/><path fill="currentColor" stroke="none" d="M12 4a8 8 0 0 1 0 16Z"/>',
		sun: '<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
		moon: '<path fill="currentColor" stroke="none" d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.5 8.5 0 1 0 10.6 10.6Z"/>',
		back15:
			'<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 4v3.5h3.5"/><text x="12" y="15.4" fill="currentColor" stroke="none" font-size="8" font-weight="700" text-anchor="middle" font-family="system-ui">15</text>',
		forward30:
			'<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M20 4v3.5h-3.5"/><text x="12" y="15.4" fill="currentColor" stroke="none" font-size="8" font-weight="700" text-anchor="middle" font-family="system-ui">30</text>',
		minus: '<path d="M6 12h12"/>',
		plus: '<path d="M6 12h12M12 6v12"/>',
		ruler: '<path d="M3 15.5 15.5 3 21 8.5 8.5 21z"/><path d="m7 12 2 2M10 9l2 2M13 6l2 2"/>',
		star: '<path fill="currentColor" stroke-width="1.5" d="m12 3.2 2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.38 2.85 1.03-6L3.3 9.6l6-.9Z"/>'
	};

	export type IconName = keyof typeof ICONS;
</script>

<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		name: IconName;
		class?: ClassValue;
	}

	let { name, class: className = 'size-5' }: Props = $props();
</script>

<svg
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2.2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	class={['shrink-0', className]}
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static markup from the map above -->
	{@html ICONS[name]}
</svg>
