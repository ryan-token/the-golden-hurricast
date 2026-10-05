<!--
	@component
	"Leave a 5-star review" button and its sheet (see ReviewSheet). Like AskQuestion, the button
	opens the sheet with the Invoker Commands API, so it works without JavaScript.
-->
<script lang="ts">
	import Button, { type ButtonSize, type ButtonVariant } from '#lib/components/Button.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import ReviewSheet from '#lib/components/ReviewSheet.svelte';

	interface Props {
		variant?: ButtonVariant;
		size?: ButtonSize;
	}

	let { variant = 'quiet', size = 'lg' }: Props = $props();

	const id = $props.id();
</script>

<Button {variant} {size} commandfor={id} command="show-modal">
	<span aria-hidden="true" class="grid size-6 place-items-center rounded-full bg-gold text-night">
		<Icon name="star" class="size-3.5" />
	</span>
	Leave a 5-star review
</Button>

<ReviewSheet {id} />
