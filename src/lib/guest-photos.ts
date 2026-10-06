import type { Picture } from 'vite-imagetools';
import angieNelp from '#lib/assets/guests/angie-nelp.jpg?enhanced';
import ericKonkol from '#lib/assets/guests/eric-konkol.jpg?enhanced';
import justinMoore from '#lib/assets/guests/justin-moore.jpg?enhanced';
import stacyLeeds from '#lib/assets/guests/stacy-leeds.jpg?enhanced';
import treLamb from '#lib/assets/guests/tre-lamb.jpg?enhanced';
import type { FeaturedGuest } from '#lib/guests.js';

/** Official headshots from utulsa.edu and tulsahurricane.com, cropped to 4:5. */
export const GUEST_PHOTOS: Record<FeaturedGuest['slug'], Picture> = {
	'stacy-leeds': stacyLeeds,
	'justin-moore': justinMoore,
	'tre-lamb': treLamb,
	'eric-konkol': ericKonkol,
	'angie-nelp': angieNelp
};
