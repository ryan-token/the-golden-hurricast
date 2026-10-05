/**
 * The episode archive's current filters as a query string ("?q=oklahoma"), so a way back to the
 * archive from an episode can restore them. Only ever set in the browser (by the archive page),
 * so sharing it across server requests is harmless.
 */
export const archive = $state({ search: '' });
