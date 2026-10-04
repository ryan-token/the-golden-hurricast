<!--
	@component
	A section title with a rule underneath, as used throughout the site's page bodies.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Lets the section reference its heading with `aria-labelledby`. */
		id?: string;
		children: Snippet;
	}

	let { id, children }: Props = $props();
</script>

<h2 {id} class="mb-2 text-[min(calc(1.275rem_+_0.3vw),1.5rem)]">{@render children()}</h2>
<hr class="mt-0 mb-6" />
