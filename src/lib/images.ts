/**
 * Product photos come from Stripe as full-size originals (often several megabytes). On
 * Netlify, serve them through the Netlify Image CDN instead, resized and re-encoded (AVIF or
 * WebP, whichever the browser accepts). Allowed sources are listed in netlify.toml.
 */
export function productImage(url: string, size: number, useImageCdn: boolean) {
	if (!useImageCdn) return { src: url };

	const at = (width: number) =>
		`/.netlify/images?url=${encodeURIComponent(url)}&w=${width}&h=${width}&fit=cover`;
	return { src: at(size), srcset: `${at(size)} 1x, ${at(size * 2)} 2x` };
}
