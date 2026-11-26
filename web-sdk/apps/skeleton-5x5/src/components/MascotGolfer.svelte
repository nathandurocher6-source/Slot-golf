<script lang="ts">
	import { getContext } from '../game/context';
	import { golfAssetUrl } from '../game/golfAssets';
	import { getFairwayLayout, getFrameOnScreen } from '../game/studioVisuals';

	const context = getContext();
	const sizes = $derived(context.stateLayoutDerived.canvasSizes());
	const frame = $derived(
		getFrameOnScreen(
			context.stateLayoutDerived.mainLayout(),
			context.stateGameDerived.boardLayout(),
		),
	);
	const fairway = $derived(getFairwayLayout(sizes, frame));
</script>

{#if fairway.golferHeight > 0}
	<img
		class="mascot"
		style:left={`${fairway.golferX}px`}
		style:top={`${fairway.floor}px`}
		style:height={`${fairway.golferHeight}px`}
		src={golfAssetUrl('mascot')}
		alt="Birdie Breakout golfer"
		draggable="false"
	/>
{/if}

<style>
	.mascot {
		position: fixed;
		width: auto;
		transform: translate(-50%, -100%);
		z-index: 45;
		pointer-events: none;
	}
</style>
