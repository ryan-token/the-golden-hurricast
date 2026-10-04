<!--
	@component
	Top navigation bar. On small screens the links collapse into a native popover menu,
	which opens and closes without JavaScript.
-->
<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import logo from '#lib/assets/logo-navbar-white.png?enhanced';
	import { LINKS, SITE } from '#lib/site.js';

	const NAV_LINKS = [
		{ label: 'Podcast', href: '/podcast/' },
		{ label: 'Patreon', href: LINKS.patreon, external: true },
		{ label: 'Merch', href: '/merch/' },
		{ label: 'About', href: '/about/' },
		{ label: 'Support', href: '/support/' }
	];

	let menu = $state<HTMLElement>();

	// Close the mobile menu after client-side navigation.
	afterNavigate(() => menu?.hidePopover());

	const isCurrent = (href: string) => page.url.pathname.startsWith(href);
</script>

<header class="site-header sticky top-0 z-50 bg-navbar text-white">
	<nav aria-label="Main" class="mx-auto flex items-center justify-between gap-4 p-2.5">
		<a href="/" class="flex items-center gap-4 text-xl text-white no-underline hover:text-white">
			<enhanced:img src={logo} alt="" class="size-12" sizes="48px" />
			{SITE.name}
		</a>

		<button
			type="button"
			popovertarget="site-menu"
			class="rounded-md border border-white/20 p-2 text-white/75 hover:text-white md:hidden"
		>
			<span class="sr-only">Menu</span>
			<svg viewBox="0 0 24 24" class="size-6" aria-hidden="true">
				<path
					d="M3 6h18M3 12h18M3 18h18"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		</button>

		<ul id="site-menu" popover bind:this={menu} class="site-menu">
			{#each NAV_LINKS as link (link.href)}
				<li>
					<a
						href={link.href}
						aria-current={!link.external && isCurrent(link.href) ? 'page' : undefined}
						class="block px-2 py-2 text-white/60 no-underline hover:text-white/80 aria-[current=page]:text-white"
					>
						{link.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>

<style>
	.site-header {
		anchor-name: --site-header;
	}

	/* Mobile: a full-width dropdown anchored under the bar. */
	.site-menu {
		position-anchor: --site-header;
		inset: anchor(bottom) 0 auto 0;
		width: 100%;
		margin: 0;
		border: 0;
		padding: 0.25rem 1.5rem 0.75rem;
		background: var(--color-navbar);
	}

	/* Desktop: always visible, inline in the bar. */
	@media (min-width: 48rem) {
		.site-menu,
		.site-menu:not(:popover-open) {
			display: flex;
			position: static;
			width: auto;
			padding: 0;
			overflow: visible;
			background: none;
			gap: 0.25rem;
		}
	}
</style>
