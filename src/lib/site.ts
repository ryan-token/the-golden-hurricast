/** Site-wide constants: identity, canonical origin, and outbound links. */
export const SITE = {
	name: 'The Golden Hurricast',
	shortName: 'TGH',
	url: 'https://www.thegoldenhurricast.com',
	description:
		'The leading independent podcast covering Golden Hurricane athletics at The University of Tulsa',
	email: 'thegoldenhurricast@gmail.com',
	xHandle: '@GoldenHurricast',
	blueskyHandle: '@thegoldenhurricast.com',
	/** Default 1200×630 share image, relative to the site root. */
	ogImage: '/og-image.png'
} as const;

export const LINKS = {
	applePodcasts:
		'https://podcasts.apple.com/us/podcast/the-golden-hurricast/id1435008302?itscg=30200&itsct=podcast_box&ls=1&mttnsubad=1435008302',
	spotify: 'https://open.spotify.com/show/16ik0AuBrpVBfWn73jlJio',
	spotifyCreators: 'https://creators.spotify.com/pod/show/thegoldenhurricast',
	spotifySupport: 'https://creators.spotify.com/pod/show/thegoldenhurricast/support',
	overcast: 'https://overcast.fm/itunes1435008302/the-golden-hurricast',
	pocketCasts: 'https://pca.st/podcast/eba6ed30-9102-0136-7b92-27f978dac4db',
	castro: 'https://castro.fm/podcast/56521e78-b84b-429b-a580-073bd42d97a7',
	goodpods: 'https://goodpods.com/podcasts/the-golden-hurricast-185396',
	patreon: 'https://patreon.com/thegoldenhurricast',
	discord: 'https://discord.gg/xkPegtBjVD',
	x: 'https://x.com/GoldenHurricast',
	bluesky: 'https://bsky.app/profile/thegoldenhurricast.com',
	paypal: 'https://paypal.me/thegoldenhurricast',
	mastodon: 'https://indieweb.social/@ryantoken',
	mythic: 'https://www.mythic.press/',
	collegian: 'https://tucollegian.org/',
	loyalAlwaysTrue: 'https://utulsa.edu/give/giving-opportunities/support/loyal-always-true/',
	rss: 'https://anchor.fm/s/532d7b4/podcast/rss',
	email: `mailto:${SITE.email}`
} as const;

/** Where to listen, in the order we list them. */
export const LISTEN_ON = [
	{ name: 'Apple Podcasts', href: LINKS.applePodcasts },
	{ name: 'Spotify', href: LINKS.spotify },
	{ name: 'Overcast', href: LINKS.overcast },
	{ name: 'Pocket Casts', href: LINKS.pocketCasts },
	{ name: 'Castro', href: LINKS.castro },
	{ name: 'Goodpods', href: LINKS.goodpods }
] as const;

/** Absolute URL for a site-relative path, e.g. `absoluteUrl('/podcast/')`. */
export function absoluteUrl(path: string): string {
	return new URL(path, SITE.url).href;
}

export const PATREON_TIERS = [
	{
		name: 'Carrot Cane',
		price: 5,
		perks: [
			'Keeps the show ad-free and independent',
			'10% goes to TU’s Loyal Always True fund',
			'Bonus content, like the occasional blog post',
			'Private Discord with us',
			'20% off all merch'
		]
	},
	{
		name: 'Gus T. Hurricane',
		price: 10,
		featured: true,
		perks: ['Everything in Carrot Cane', 'Video versions of the podcast', 'TGH sticker']
	},
	{
		name: 'Hurc the Hurricane',
		price: 25,
		perks: ['Everything in Gus T. Hurricane', 'Input on topics for upcoming shows']
	}
] as const;
