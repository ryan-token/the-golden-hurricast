<!--
	@component
	A grouped list of links in one rounded panel, like an iOS settings group.
-->
<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';

	interface Props {
		links: readonly { name: string; href: string; detail?: string }[];
		class?: string;
	}

	let { links, class: className }: Props = $props();

	const isExternal = (href: string) => /^https?:/.test(href);
</script>

<ul
	class={[
		'divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface',
		className
	]}
>
	{#each links as { name, href, detail } (name)}
		{@const external = isExternal(href)}
		<li>
			<a
				{href}
				target={external ? '_blank' : undefined}
				rel={external ? 'noopener' : undefined}
				class="flex min-h-12 items-center gap-3 px-4 py-2.5 transition-colors hover:bg-sand"
			>
				<span class="min-w-0 flex-1">
					<span class="block font-semibold text-heading">{name}</span>
					{#if detail}<span class="block text-sm text-muted">{detail}</span>{/if}
				</span>
				<Icon name={external ? 'external' : 'chevron'} class="size-4 text-muted" />
				{#if external}<span class="sr-only">(opens in a new tab)</span>{/if}
			</a>
		</li>
	{/each}
</ul>
