<!--
	@component
	"Ask a Question for the Show" button and dialog.

	Works without JavaScript: the button opens the native `<dialog>` with the Invoker
	Commands API, and the form posts to `/api/questions/`, which redirects to a confirmation
	page. With JavaScript, the submission happens in place: the dialog thanks the listener,
	then closes itself.
-->
<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import { SITE } from '#lib/site.js';

	const DIALOG_ID = 'ask-question';
	const ACTION = '/api/questions/';
	/** How long the thank-you shows before the dialog closes itself. */
	const THANKS_MS = 4000;

	type Status = { kind: 'error'; message: string } | { kind: 'failed' } | undefined;

	let dialog = $state<HTMLDialogElement>();
	let pending = $state(false);
	/** Problem shown inside the dialog. */
	let status = $state<Status>();
	/** The question was sent: the dialog shows a thank-you, then closes. */
	let submitted = $state(false);

	$effect(() => {
		if (!submitted) return;
		const timer = setTimeout(() => dialog?.close(), THANKS_MS);
		return () => clearTimeout(timer);
	});

	async function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		const form = event.currentTarget;
		const data = new FormData(form);

		if (String(data.get('question') ?? '').trim() === '') {
			status = { kind: 'error', message: 'Please enter a question.' };
			const field = form.elements.namedItem('question');
			if (field instanceof HTMLTextAreaElement) field.focus();
			return;
		}

		pending = true;
		status = undefined;

		try {
			const response = await fetch(ACTION, {
				method: 'POST',
				body: data,
				headers: { accept: 'application/json' }
			});

			if (response.ok) {
				form.reset();
				submitted = true;
			} else if (response.status === 400 || response.status === 429) {
				const body: { message?: string } = await response.json().catch(() => ({}));
				status = { kind: 'error', message: body.message ?? 'Please check your question.' };
			} else {
				status = { kind: 'failed' };
			}
		} catch {
			status = { kind: 'failed' };
		} finally {
			pending = false;
		}
	}
</script>

<Button commandfor={DIALOG_ID} command="show-modal">Ask a Question for the Show</Button>

<dialog
	id={DIALOG_ID}
	bind:this={dialog}
	closedby="any"
	aria-labelledby="ask-question-title"
	onclose={() => {
		status = undefined;
		submitted = false;
	}}
	class={[
		'm-auto w-[calc(100%-2rem)] max-w-lg rounded-lg bg-white text-ink shadow-xl',
		// Fades and slides in (and back out), like Bootstrap's modal. Pure CSS, so it also
		// animates when opened without JavaScript; `transition-discrete` keeps the dialog
		// rendered while it animates out.
		'-translate-y-8 opacity-0 transition-[opacity,translate,display,overlay] transition-discrete duration-300 ease-out',
		'open:translate-y-0 open:opacity-100 starting:open:-translate-y-8 starting:open:opacity-0',
		'backdrop:bg-black/0 backdrop:transition-[background-color,display,overlay] backdrop:transition-discrete backdrop:duration-150',
		'open:backdrop:bg-black/50 starting:open:backdrop:bg-black/0',
		'motion-reduce:transition-none motion-reduce:backdrop:transition-none'
	]}
>
	<div class="flex items-center justify-between border-b border-line px-4 py-3">
		<h2 id="ask-question-title" class="text-xl">Ask a Question</h2>
		<button
			type="button"
			commandfor={DIALOG_ID}
			command="close"
			class="-mr-1 rounded p-1 text-muted hover:text-ink"
		>
			<span class="sr-only">Close</span>
			<svg viewBox="0 0 24 24" class="size-5" aria-hidden="true">
				<path
					d="M6 6l12 12M18 6L6 18"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		</button>
	</div>

	<form method="POST" action={ACTION} onsubmit={submit}>
		<div class="space-y-4 p-4">
			<p hidden={submitted}>
				Submit a question and we'll do our best to answer it on an upcoming show. Feel free to ask
				anonymously if you'd prefer us not to mention your name.
			</p>

			<div hidden={submitted}>
				<label for="ask-question-text" class="mb-2 block font-bold">
					What is your question for us?
				</label>
				<textarea
					id="ask-question-text"
					name="question"
					rows="3"
					required
					maxlength="2000"
					aria-invalid={status?.kind === 'error' ? 'true' : undefined}
					aria-describedby={status?.kind === 'error' ? 'ask-question-status' : undefined}
					class="block w-full rounded-md border border-line px-3 py-1.5 focus-visible:border-primary aria-invalid:border-danger"
				></textarea>
			</div>

			<div hidden={submitted}>
				<label for="ask-question-name" class="mb-2 block font-bold">
					What is your name? <span class="font-normal text-muted">(optional)</span>
				</label>
				<input
					id="ask-question-name"
					name="name"
					type="text"
					maxlength="100"
					autocomplete="name"
					placeholder="Your Name"
					class="block w-full rounded-md border border-line px-3 py-1.5 focus-visible:border-primary"
				/>
			</div>

			<!-- Honeypot: invisible to people, tempting to bots. Submissions that fill it are dropped. -->
			<div aria-hidden="true" class="absolute -left-[9999px] h-px w-px overflow-hidden">
				<label for="ask-question-website">Leave this field empty</label>
				<input
					id="ask-question-website"
					name="website"
					type="text"
					tabindex="-1"
					autocomplete="off"
				/>
			</div>

			<div id="ask-question-status" aria-live="polite">
				{#if submitted}
					<p class="text-lg">
						✅ Thanks for submitting a question! We'll try to answer it on the podcast soon.
					</p>
				{:else if status?.kind === 'error'}
					<p class="text-danger">{status.message}</p>
				{:else if status?.kind === 'failed'}
					<p class="text-danger">
						There was an error submitting your question. Sorry about that. If you'd like to submit
						your question over email, send one to
						<a href="mailto:{SITE.email}?subject=Listener%20Question">{SITE.email}</a>.
					</p>
				{/if}
			</div>
		</div>

		<div class="flex justify-end gap-2 border-t border-line px-4 py-3">
			<Button variant="secondary" commandfor={DIALOG_ID} command="close">Close</Button>
			{#if !submitted}
				<Button type="submit" disabled={pending}>{pending ? 'Submitting…' : 'Submit'}</Button>
			{/if}
		</div>
	</form>
</dialog>
