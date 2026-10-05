<!--
	@component
	A modal `<dialog>`: a bottom sheet on phones, centred on wider screens. Open it from a button
	with `commandfor={id} command="show-modal"`, which works without JavaScript.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		/** The id of the element that names the dialog. */
		labelledby: string;
		width?: 'md' | 'lg';
		onclose?: () => void;
		children: Snippet;
	}

	let { id, labelledby, width = 'md', onclose, children }: Props = $props();

	/**
	 * Clicking the backdrop closes the dialog. `closedby="any"` does that natively (even without
	 * JavaScript); browsers that don't support it yet (Safari) get this instead. The press has to
	 * start on the backdrop too, so selecting text in a field and letting go outside doesn't close it.
	 */
	function closeOnBackdropClick(dialog: HTMLDialogElement) {
		if ('closedBy' in HTMLDialogElement.prototype) return;

		// Clicks on the backdrop target the dialog itself, which has no padding of its own.
		let pressedBackdrop = false;
		const press = (event: PointerEvent) => (pressedBackdrop = event.target === dialog);
		const click = (event: MouseEvent) => {
			if (pressedBackdrop && event.target === dialog) dialog.close();
		};
		dialog.addEventListener('pointerdown', press);
		dialog.addEventListener('click', click);
		return () => {
			dialog.removeEventListener('pointerdown', press);
			dialog.removeEventListener('click', click);
		};
	}
</script>

<dialog
	{id}
	closedby="any"
	{@attach closeOnBackdropClick}
	aria-labelledby={labelledby}
	{onclose}
	class={[
		'm-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-xl bg-surface text-ink shadow-float',
		'sm:m-auto sm:max-h-[min(90dvh,48rem)] sm:w-[calc(100%-2rem)] sm:rounded-xl',
		width === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-lg',
		// Rises in (and back out) with CSS alone, so it also animates without JavaScript.
		'translate-y-6 opacity-0 transition-[opacity,translate,display,overlay] transition-discrete duration-250 ease-snappy',
		'open:translate-y-0 open:opacity-100 starting:open:translate-y-6 starting:open:opacity-0',
		'backdrop:bg-night/0 backdrop:transition-[background-color,display,overlay] backdrop:transition-discrete backdrop:duration-250',
		'open:backdrop:bg-night/55 starting:open:backdrop:bg-night/0'
	]}
>
	<span
		aria-hidden="true"
		class="pointer-events-none absolute top-2 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-current opacity-25 sm:hidden"
	></span>
	{@render children()}
</dialog>
