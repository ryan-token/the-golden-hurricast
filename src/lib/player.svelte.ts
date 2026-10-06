import { createContext } from 'svelte';
import type { Episode } from '#lib/episodes.js';

const STORAGE_KEY = 'player';

/** `play()` rejects when a new episode interrupts loading; the `paused` binding shows the truth. */
const ignore = () => {};

/**
 * The site-wide audio player. One `<audio>` element lives in the root layout (see MiniPlayer),
 * so playback carries on across page navigations. Playback starts from the click handler that
 * asked for it: some browsers refuse `play()` once the user's gesture has passed.
 */
export class Player {
	episode = $state<Episode>();
	paused = $state(true);
	currentTime = $state(0);
	duration = $state(0);
	audio = $state<HTMLAudioElement>();

	isPlaying(slug: string) {
		return this.episode?.slug === slug && !this.paused;
	}

	/** Plays `episode`, or toggles it if it's already loaded. */
	toggle(episode: Episode) {
		if (this.episode?.slug === episode.slug) {
			if (this.paused) this.audio?.play().catch(ignore);
			else this.audio?.pause();
			return;
		}
		this.load(episode);
		this.audio?.play().catch(ignore);
	}

	/** Loads without playing, e.g. to resume a saved position after a reload. */
	load(episode: Episode, at = 0) {
		this.episode = episode;
		this.currentTime = at;
		this.duration = episode.duration;
		if (this.audio) this.audio.src = at ? `${episode.audio}#t=${Math.floor(at)}` : episode.audio;
	}

	/** Plays `episode` from `seconds` in, e.g. from a chapter in its show notes. */
	playFrom(episode: Episode, seconds: number) {
		if (this.episode?.slug === episode.slug) this.seek(seconds);
		else this.load(episode, seconds);
		this.audio?.play().catch(ignore);
	}

	seek(seconds: number) {
		if (!this.audio) return;
		this.audio.currentTime = Math.min(Math.max(seconds, 0), this.duration || Infinity);
	}

	skip(delta: number) {
		this.seek(this.currentTime + delta);
	}

	close() {
		this.audio?.pause();
		this.audio?.removeAttribute('src');
		this.episode = undefined;
		this.forget();
	}

	save() {
		if (!this.episode) return;
		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ episode: this.episode, at: Math.floor(this.currentTime) })
			);
		} catch {
			// Storage can be unavailable (private browsing, blocked cookies); resuming is a nicety.
		}
	}

	/** The episode and position saved by `save()`, if any. */
	saved(): { episode: Episode; at: number } | undefined {
		try {
			const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
			return value?.episode?.audio ? value : undefined;
		} catch {
			return undefined;
		}
	}

	forget() {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// See save().
		}
	}
}

export const [getPlayer, setPlayer] = createContext<Player>();
