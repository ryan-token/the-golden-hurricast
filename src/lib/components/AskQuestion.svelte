<!--
	@component
	"Ask a question" button and dialog.

	Works without JavaScript: the button opens the native `<dialog>` with the Invoker Commands
	API, and the form posts to `/api/questions/`, which redirects to a confirmation page. With
	JavaScript, the submission happens in place and the dialog thanks the listener.
-->
<script lang="ts">
	import Button, { type ButtonSize, type ButtonVariant } from '#lib/components/Button.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Sheet from '#lib/components/Sheet.svelte';
	import { SITE } from '#lib/site.js';

	interface Props {
		variant?: ButtonVariant;
		size?: ButtonSize;
	}

	let { variant = 'quiet', size = 'lg' }: Props = $props();

	const id = $props.id();
	const ACTION = '/api/questions/';

	type Status = { kind: 'error'; message: string } | { kind: 'failed' } | undefined;

	let pending = $state(false);
	let status = $state<Status>();
	/** The question that was sent, shown back in the thank-you. */
	let sent = $state<{ question: string; name: string }>();
	let heading = $state<HTMLElement>();

	// The form is replaced by the thank-you: move focus to its heading so it's announced.
	$effect(() => {
		if (sent) heading?.focus();
	});

	async function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		const form = event.currentTarget;
		const data = new FormData(form);
		const question = String(data.get('question') ?? '').trim();

		if (question === '') {
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
				sent = { question, name: String(data.get('name') ?? '').trim() };
				form.reset();
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

	const field =
		'block w-full rounded-md border border-line-strong bg-canvas px-4 py-3 text-base text-ink placeholder:text-muted/70 transition-colors focus-visible:border-accent aria-invalid:border-alert';
</script>

<Button {variant} {size} commandfor={id} command="show-modal">
	<span
		aria-hidden="true"
		class="grid size-6 place-items-center rounded-full bg-gold font-display text-base font-black text-night"
		>?</span
	>
	Ask a question
</Button>

<Sheet
	{id}
	labelledby="{id}-title"
	onclose={() => {
		status = undefined;
		sent = undefined;
	}}
>
	<div class="relative bg-gold px-6 pt-7 pb-6 text-night">
		<h2
			id="{id}-title"
			bind:this={heading}
			tabindex="-1"
			class="pr-10 font-display text-3xl leading-none font-extrabold text-royal focus-ring-none"
		>
			{sent ? 'It’s in the mailbag.' : 'Got a question for the show?'}
		</h2>
		<p class="mt-2 max-w-[34ch] text-[0.9375rem]">
			{sent
				? 'Thanks for listening, and for asking.'
				: 'A game, a recruit, a fourth-down call you’re still mad about. We answer the good ones on air.'}
		</p>
		<button
			type="button"
			commandfor={id}
			command="close"
			class="absolute top-3 right-3 grid size-10 place-items-center rounded-full hover:bg-night/10"
		>
			<span class="sr-only">Close</span>
			<Icon name="close" />
		</button>
	</div>

	{#if sent}
		<div class="grid gap-5 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
			<blockquote class="rounded-md bg-sand px-4 py-3 text-ink">
				“{sent.question}”{#if sent.name}<footer class="mt-1 text-sm text-muted">
						{sent.name}
					</footer>{/if}
			</blockquote>
			<p class="text-muted">
				We go through questions before every recap. If yours makes the cut, you’ll hear it on the
				next episode.
			</p>
			<Button commandfor={id} command="close" class="justify-self-end">Done</Button>
		</div>
	{:else}
		<form
			method="POST"
			action={ACTION}
			onsubmit={submit}
			class="grid gap-5 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
		>
			<div>
				<label for="{id}-question" class="mb-2 block font-semibold">Your question</label>
				<textarea
					id="{id}-question"
					name="question"
					rows="4"
					required
					maxlength="2000"
					placeholder="Who starts at quarterback against Memphis, and why is it obvious?"
					aria-invalid={status?.kind === 'error' ? 'true' : undefined}
					aria-describedby={status?.kind === 'error' ? `${id}-status` : undefined}
					class={field}></textarea>
			</div>

			<div>
				<label for="{id}-name" class="mb-2 block font-semibold">
					Your name <span class="font-normal text-muted">(optional)</span>
				</label>
				<input
					id="{id}-name"
					name="name"
					type="text"
					maxlength="100"
					autocomplete="given-name"
					placeholder="First name is plenty"
					class={field}
				/>
				<p class="mt-2 text-sm text-muted">
					Leave it blank and we’ll read it as “a listener asks.”
				</p>
			</div>

			<!-- Honeypot: invisible to people, tempting to bots. Submissions that fill it are dropped. -->
			<div aria-hidden="true" class="absolute -left-[9999px] h-px w-px overflow-hidden">
				<label for="{id}-website">Leave this field empty</label>
				<input id="{id}-website" name="website" type="text" tabindex="-1" autocomplete="off" />
			</div>

			<div id="{id}-status" aria-live="polite">
				{#if status?.kind === 'error'}
					<p class="font-semibold text-alert">{status.message}</p>
				{:else if status?.kind === 'failed'}
					<p class="text-alert">
						We couldn’t send your question. Sorry about that. You can email it to
						<a href="mailto:{SITE.email}?subject=Listener%20Question" class="link">{SITE.email}</a>
						instead.
					</p>
				{/if}
			</div>

			<div class="flex justify-end gap-3">
				<Button variant="quiet" commandfor={id} command="close">Cancel</Button>
				<Button type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send question'}</Button>
			</div>
		</form>
	{/if}
</Sheet>
