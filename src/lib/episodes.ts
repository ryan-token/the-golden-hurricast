/** A podcast episode as the site uses it. Built from the RSS feed by `#lib/server/episodes.ts`. */
export interface Episode {
	slug: string;
	/** Missing for specials outside the numbered seasons. */
	season?: number;
	/** Usually an integer, but the feed has the odd half episode (`4-27.5`). */
	number?: number;
	bonus: boolean;
	title: string;
	/** The parenthetical after the title, e.g. "Arkansas Recap & North Texas Preview". */
	subtitle?: string;
	guest?: { name: string; outlet?: string };
	/** `YYYY-MM-DD`. */
	published: string;
	/** In seconds. */
	duration: number;
	/** Plain-text opening of the show notes. */
	summary: string;
	audio: string;
}

export const episodePath = (slug: string) => `/podcast/episodes/${slug}/`;

/** "S9 · E6", "S3 · E21 Bonus" or "Special". */
export function episodeLabel({
	season,
	number,
	bonus
}: Pick<Episode, 'season' | 'number' | 'bonus'>) {
	if (season === undefined || number === undefined) return 'Special';
	return `S${season} · E${number}${bonus ? ' Bonus' : ''}`;
}

const DATE = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	timeZone: 'UTC'
});

/** "Sep 29, 2026". */
export const formatDate = (isoDate: string) => DATE.format(new Date(isoDate));

/** "1 hr 49 min", "2 hr" or "43 min". */
export function formatDuration(seconds: number): string {
	const total = Math.round(seconds / 60);
	const [hours, minutes] = [Math.floor(total / 60), total % 60];
	if (!hours) return `${minutes} min`;
	return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

/** A player clock: "1:02:07" or "4:05". */
export function formatClock(seconds: number): string {
	const total = Math.max(0, Math.floor(seconds));
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = String(total % 60).padStart(2, '0');
	return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
