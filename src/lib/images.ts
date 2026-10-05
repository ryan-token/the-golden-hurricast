/** Where Stripe serves files uploaded in the Dashboard, such as product photos. */
export const STRIPE_FILE_LINK = 'https://files.stripe.com/links/';

/**
 * Product photos come from Stripe as full-size originals (often several megabytes). On
 * Netlify, serve them through the Netlify Image CDN instead, resized and re-encoded (AVIF or
 * WebP, whichever the browser accepts). The CDN reads them from `/merch/photos/<token>`,
 * which makes them cacheable (see that route).
 */
export function productImage(url: string, size: number, useImageCdn: boolean) {
	if (!useImageCdn || !url.startsWith(STRIPE_FILE_LINK)) return { src: url };

	const source = `/merch/photos/${url.slice(STRIPE_FILE_LINK.length)}`;
	const at = (width: number) =>
		`/.netlify/images?url=${encodeURIComponent(source)}&w=${width}&h=${width}&fit=cover`;
	return { src: at(size), srcset: `${at(size)} 1x, ${at(size * 2)} 2x` };
}
