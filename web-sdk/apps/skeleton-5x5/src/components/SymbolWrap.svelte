<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Container } from 'pixi-svelte';
	import { getContextBoard } from 'components-shared';

	import { SYMBOL_SIZE, BOARD_DIMENSIONS } from '../game/constants';

	type Props = {
		x: number;
		y: number;
		animating: boolean;
		children: Snippet;
	};

	const props: Props = $props();
	const boardContext = getContextBoard();
	const show = $derived(
		(boardContext.animate && props.animating) || (!boardContext.animate && !props.animating),
	);
	// Include the animated offset and rotated tile corners in the culling margin.
	const top = -SYMBOL_SIZE * 0.82;
	const bottom = SYMBOL_SIZE * (BOARD_DIMENSIONS.y + 0.82);
	const inFrame = $derived(props.y > top && props.y < bottom);
</script>

{#if show && inFrame}
	<Container x={props.x} y={props.y}>
		{@render props.children()}
	</Container>
{/if}
