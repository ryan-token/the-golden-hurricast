// `@sveltejs/enhanced-img` only types imports ending in `?enhanced`. This also covers imports
// that pass imagetools directives first, e.g. `./icon.png?w=70&enhanced`.
declare module '*&enhanced' {
	import type { Picture } from 'vite-imagetools';

	const value: Picture;
	export default value;
}
