/**
 * Builders for schema.org JSON-LD. Pages pass the result to `<Seo jsonLd={...} />`.
 * See https://developers.google.com/search/docs/appearance/structured-data/search-gallery
 */
import { LINKS, SITE, absoluteUrl } from '#lib/site.js';

export type JsonLd = { '@context'?: 'https://schema.org'; '@type': string } & Record<
	string,
	unknown
>;

const ORGANIZATION_ID = `${SITE.url}/#organization`;
const SERIES_ID = `${SITE.url}/podcast/#series`;

/** An ISO 8601 duration, e.g. `PT1H49M9S`. */
function isoDuration(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.round(seconds % 60);
	return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s || (!h && !m) ? `${s}S` : ''}`;
}

export function organization(): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': ORGANIZATION_ID,
		name: SITE.name,
		url: absoluteUrl('/'),
		logo: absoluteUrl('/logo-300px.png'),
		email: SITE.email,
		sameAs: [LINKS.applePodcasts, LINKS.spotify, LINKS.patreon, LINKS.x, LINKS.bluesky]
	};
}

export function website(): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE.name,
		alternateName: SITE.shortName,
		url: absoluteUrl('/'),
		publisher: { '@id': ORGANIZATION_ID }
	};
}

export function podcastSeries(): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'PodcastSeries',
		'@id': SERIES_ID,
		name: SITE.name,
		description: 'A weekly podcast covering Golden Hurricane athletics at The University of Tulsa.',
		webFeed: LINKS.rss,
		url: absoluteUrl('/podcast/'),
		image: absoluteUrl(SITE.ogImage),
		author: { '@id': ORGANIZATION_ID },
		sameAs: [LINKS.applePodcasts, LINKS.spotify, LINKS.overcast, LINKS.pocketCasts]
	};
}

export function blogPosting(post: {
	title: string;
	description: string;
	path: string;
	authors: string[];
	published: string;
	image?: string;
}): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description: post.description,
		url: absoluteUrl(post.path),
		mainEntityOfPage: absoluteUrl(post.path),
		datePublished: post.published,
		image: absoluteUrl(post.image ?? SITE.ogImage),
		author: post.authors.map((name) => ({ '@type': 'Person', name })),
		publisher: { '@id': ORGANIZATION_ID }
	};
}

export function breadcrumbs(items: { name: string; path: string }[]): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path)
		}))
	};
}

export function product(item: {
	name: string;
	image: string | undefined;
	/** Price in the currency's minor unit (cents). */
	unitAmount: number;
	currency: string;
	inStock: boolean;
}): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: item.name,
		image: item.image,
		brand: { '@type': 'Brand', name: SITE.name },
		offers: {
			'@type': 'Offer',
			url: absoluteUrl('/merch/'),
			price: (item.unitAmount / 100).toFixed(2),
			priceCurrency: item.currency.toUpperCase(),
			availability: item.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
			itemCondition: 'https://schema.org/NewCondition',
			seller: { '@id': ORGANIZATION_ID },
			// Shipping is included in the price, US only.
			shippingDetails: {
				'@type': 'OfferShippingDetails',
				shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
				shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' }
			}
		}
	};
}

export function podcastEpisode(episode: {
	title: string;
	description: string;
	path: string;
	published: string;
	/** In seconds. */
	duration: number;
	audio: string;
	season?: number;
	number?: number;
}): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'PodcastEpisode',
		name: episode.title,
		description: episode.description,
		url: absoluteUrl(episode.path),
		datePublished: episode.published,
		...(episode.duration > 0 && { duration: isoDuration(episode.duration) }),
		...(episode.number !== undefined && { episodeNumber: episode.number }),
		...(episode.season !== undefined && {
			partOfSeason: { '@type': 'PodcastSeason', seasonNumber: episode.season }
		}),
		associatedMedia: {
			'@type': 'AudioObject',
			contentUrl: episode.audio,
			encodingFormat: 'audio/mpeg'
		},
		partOfSeries: {
			'@type': 'PodcastSeries',
			'@id': SERIES_ID,
			name: SITE.name,
			url: absoluteUrl('/podcast/')
		}
	};
}
