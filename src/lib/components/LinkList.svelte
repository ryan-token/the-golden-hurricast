<!--
	@component
	A grouped list of links in one rounded panel, like an iOS settings group. An item with
	`commandfor` instead of `href` is a button that opens that dialog, e.g. a sheet on the page.
-->
<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';

	type Item = { name: string; detail?: string } & ({ href: string } | { commandfor: string });

	interface Props {
		links: readonly Item[];
		class?: string;
	}

	let { links, class: className }: Props = $props();

	const isExternal = (href: string) => /^https?:/.test(href);

	const row =
		'flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-sand';
</script>

{#snippet label(name: string, detail?: string)}
	<span class="min-w-0 flex-1">
		<span class="block font-semibold text-heading">{name}</span>
		{#if detail}<span class="block text-sm text-muted">{detail}</span>{/if}
	</span>
{/snippet}

<ul
	class={[
		'divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface',
		className
	]}
>
	{#each links as item (item.name)}
		<li>
			{#if 'commandfor' in item}
				<button
					type="button"
					commandfor={item.commandfor}
					command="show-modal"
					class={[row, 'cursor-pointer']}
				>
					{@render label(item.name, item.detail)}
					<Icon name="chevron" class="size-4 text-muted" />
				</button>
			{:else}
				{@const external = isExternal(item.href)}
				<a
					href={item.href}
					target={external ? '_blank' : undefined}
					rel={external ? 'noopener' : undefined}
					class={row}
				>
					{@render label(item.name, item.detail)}
					<Icon name={external ? 'external' : 'chevron'} class="size-4 text-muted" />
					{#if external}<span class="sr-only">(opens in a new tab)</span>{/if}
				</a>
			{/if}
		</li>
	{/each}
</ul>
