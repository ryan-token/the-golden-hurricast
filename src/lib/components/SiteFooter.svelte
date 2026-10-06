<script lang="ts">
	import Crest from '#lib/components/Crest.svelte';
	import { LINKS, LISTEN_ON, SITE } from '#lib/site.js';

	const external = { target: '_blank', rel: 'noopener' };

	const COLUMNS = [
		{
			heading: 'Listen on',
			links: LISTEN_ON.map((link) => ({ ...link, ...external }))
		},
		{
			heading: 'Follow',
			links: [
				{ name: 'Patreon', href: LINKS.patreon, ...external },
				{ name: 'Discord', href: LINKS.discord, ...external },
				{ name: 'X', href: LINKS.x, ...external },
				{ name: 'Bluesky', href: LINKS.bluesky, ...external },
				{ name: 'Email', href: LINKS.email }
			]
		},
		{
			heading: 'More',
			links: [
				{ name: 'All episodes', href: '/podcast/episodes/' },
				{ name: 'Guests', href: '/podcast/guests/' },
				{ name: 'Merch', href: '/merch/' },
				{ name: 'Support the show', href: '/about/#support' },
				{ name: 'Blog archive', href: '/blog/' },
				{ name: 'RSS feed', href: LINKS.rss }
			]
		}
	];
</script>

<footer class="bg-chrome text-on-chrome-muted">
	<div class="page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
		<div class="sm:col-span-2 lg:col-span-1">
			<Crest class="size-16" sizes="64px" />
			<p class="mt-4 font-display text-2xl font-extrabold text-white">{SITE.name}</p>
			<p class="mt-1 max-w-72 text-sm">
				Two TU alums talking Golden Hurricane athletics every week since August 2018.
			</p>
		</div>

		{#each COLUMNS as { heading, links } (heading)}
			<nav aria-label={heading}>
				<h2 class="text-sm font-semibold text-white">{heading}</h2>
				<ul class="mt-3 grid gap-2 text-sm">
					{#each links as { name, ...link } (name)}
						<li><a {...link} class="transition-colors hover:text-white">{name}</a></li>
					{/each}
				</ul>
			</nav>
		{/each}
	</div>

	<div
		class="page flex flex-wrap justify-between gap-2 border-t border-white/15 py-6 text-[0.8125rem]"
	>
		<p>Not affiliated with The University of Tulsa.</p>
		<p>© 2018–{new Date().getFullYear()} {SITE.name}</p>
	</div>
</footer>
