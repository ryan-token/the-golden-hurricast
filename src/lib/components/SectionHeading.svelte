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

<h2 {id} class="mb-6 border-b border-line pb-2 text-h4">{@render children()}</h2>
