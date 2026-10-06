export type ThemeChoice = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * The visitor's colour theme. `system` follows `prefers-color-scheme`; the others pin it with
 * `<html data-theme>`, which an inline script in `app.html` restores before first paint.
 * Only ever changed in the browser, so sharing it across server requests is harmless.
 */
export const theme = $state({ choice: 'system' as ThemeChoice });

/** Reads the choice the inline script applied. Call once the page is hydrated. */
export function syncTheme() {
	const current = document.documentElement.dataset.theme;
	theme.choice = current === 'light' || current === 'dark' ? current : 'system';
}

export function setTheme(choice: ThemeChoice) {
	theme.choice = choice;
	const root = document.documentElement;
	if (choice === 'system') delete root.dataset.theme;
	else root.dataset.theme = choice;
	try {
		if (choice === 'system') localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, choice);
	} catch {
		// Without storage the choice lasts until the next page load.
	}
}
