<!--
	@component
	The site's top bar. Below `lg`, the links move into a full-screen popover menu, which opens
	and closes without JavaScript.
-->
<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '#lib/components/Button.svelte';
	import Crest from '#lib/components/Crest.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import ThemeSwitch from '#lib/components/ThemeSwitch.svelte';
	import { LINKS, SITE } from '#lib/site.js';

	const SECTIONS = [
		{ label: 'Podcast', href: '/podcast/' },
		{ label: 'Merch', href: '/merch/' },
		{ label: 'About', href: '/about/' }
	];

	const MORE = [
		{ label: 'All episodes', href: '/podcast/episodes/' },
		{ label: 'Guests', href: '/podcast/guests/' },
		{ label: 'Support the show', href: '/about/#support' }
	];

	let menu = $state<HTMLElement>();

	afterNavigate(() => menu?.hidePopover());

	const isCurrent = (href: string) => page.url.pathname.startsWith(href);
</script>

<header class="sticky top-0 z-40 bg-chrome text-on-chrome [view-transition-name:header]">
	<div class="page flex h-16 items-center gap-3 sm:gap-6">
		<a
			href="/"
			aria-current={page.url.pathname === '/' ? 'page' : undefined}
			class="mr-auto flex min-w-0 items-center gap-2.5 sm:gap-3"
		>
			<Crest class="size-10" sizes="40px" priority />
			<!-- One line on the narrowest phones too, a size smaller there. -->
			<span
				class="font-display text-xl font-extrabold tracking-[0.005em] whitespace-nowrap min-[22.5rem]:text-[1.375rem]"
				>{SITE.name}</span
			>
		</a>

		<nav aria-label="Main" class="hidden h-full lg:block">
			<ul class="flex h-full gap-1">
				{#each SECTIONS as { label, href } (href)}
					<li class="h-full">
						<a
							{href}
							aria-current={isCurrent(href) ? 'page' : undefined}
							class="relative flex h-full items-center px-3 font-semibold text-on-chrome-muted transition-colors hover:text-white aria-[current=page]:text-white"
						>
							{label}
							{#if isCurrent(href)}
								<span
									class="absolute inset-x-3 bottom-0 h-1 rounded-t-sm bg-gold [view-transition-name:nav-indicator]"
								></span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="hidden lg:block"><ThemeSwitch /></div>

		<Button
			href={LINKS.patreon}
			target="_blank"
			rel="noopener"
			variant="gold"
			size="sm"
			class="max-sm:hidden"
		>
			Patreon <Icon name="external" class="size-4" /><span class="sr-only"
				>(opens in a new tab)</span
			>
		</Button>

		<button
			type="button"
			popovertarget="site-menu"
			class="-mr-2 h-11 rounded-full px-3 font-semibold text-white lg:hidden"
		>
			Menu
		</button>
	</div>
</header>

<div
	id="site-menu"
	popover
	bind:this={menu}
	aria-label="Site menu"
	class={[
		'fixed inset-0 m-0 size-full max-h-none max-w-none bg-chrome text-on-chrome',
		'flex-col overflow-y-auto px-(--gutter) pb-[max(1.5rem,env(safe-area-inset-bottom))] open:flex',
		'opacity-0 transition-[opacity,display,overlay] transition-discrete duration-200 open:opacity-100 starting:open:opacity-0'
	]}
>
	<div class="flex h-16 shrink-0 items-center justify-between">
		<a href="/" class="flex items-center gap-3">
			<Crest class="size-10" sizes="40px" />
			<span class="sr-only">Home</span>
		</a>
		<button
			type="button"
			popovertarget="site-menu"
			popovertargetaction="hide"
			class="-mr-2 flex h-11 items-center gap-2 rounded-full px-3 font-semibold"
		>
			Close <Icon name="close" class="size-5" />
		</button>
	</div>

	<nav aria-label="Main" class="mt-6">
		<ul>
			{#each [{ label: 'Home', href: '/' }, ...SECTIONS] as { label, href }, index (href)}
				{@const current = href === '/' ? page.url.pathname === '/' : isCurrent(href)}
				<li class="menu-item" style:--i={index}>
					<a
						{href}
						aria-current={current ? 'page' : undefined}
						class="block py-1 font-display text-[clamp(3rem,15vw,4.5rem)] leading-none font-extrabold aria-[current=page]:text-gold"
					>
						{label}
					</a>
				</li>
			{/each}
		</ul>
		<ul class="menu-item mt-8 flex flex-wrap gap-x-6 gap-y-3" style:--i={4}>
			{#each MORE as { label, href } (href)}
				<li><a {href} class="font-semibold text-on-chrome-muted hover:text-white">{label}</a></li>
			{/each}
		</ul>
	</nav>

	<div class="mt-auto grid gap-4 pt-10">
		<Button href={LINKS.patreon} target="_blank" rel="noopener" variant="gold" size="lg">
			Join us on Patreon <Icon name="external" class="size-4" />
			<span class="sr-only">(opens in a new tab)</span>
		</Button>
		<ThemeSwitch labels />
	</div>
</div>

<style>
	/* The links settle in one after another, all within a quarter second. */
	.menu-item {
		transition:
			opacity 160ms ease-out,
			translate 200ms var(--ease-snappy);
		transition-delay: calc(var(--i) * 25ms);
	}
	@starting-style {
		:popover-open .menu-item {
			opacity: 0;
			translate: 0 0.75rem;
		}
	}
</style>
