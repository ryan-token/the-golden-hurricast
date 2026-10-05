import { FEATURED_GUESTS, GUEST_GROUPS } from '#lib/guests.js';
import { cacheEpisodePage, getEpisodes, resolveAppearances } from '#lib/server/episodes.js';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ setHeaders }) => {
	const episodes = await getEpisodes();
	cacheEpisodePage(setHeaders);

	const appearances = (refs: string[]) =>
		resolveAppearances(episodes, refs).map(({ slug, season, number, bonus, title }) => ({
			slug,
			season,
			number,
			bonus,
			title
		}));

	return {
		featured: Object.fromEntries(
			FEATURED_GUESTS.map((guest) => [guest.slug, appearances(guest.appearances)])
		),
		// Every group as sections: one per school for groups organised that way, otherwise one.
		groups: GUEST_GROUPS.map((group) => ({
			name: group.name,
			sections: ('schools' in group
				? group.schools
				: [{ name: undefined, guests: group.guests }]
			).map((section) => ({
				name: section.name,
				guests: section.guests.map((guest) => ({
					...guest,
					appearances: appearances(guest.appearances)
				}))
			}))
		}))
	};
};
