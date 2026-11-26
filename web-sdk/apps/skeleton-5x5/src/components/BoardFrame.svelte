<script lang="ts" module>
	export type EmitterEventBoardFrame =
		| { type: 'boardFrameGlowShow' }
		| { type: 'boardFrameGlowHide' };
</script>

<script lang="ts">
	import { BaseSprite, Container } from 'pixi-svelte';
	import { GOLF_FRAME_PANEL } from '../game/golfAssets';
	import { getContext } from '../game/context';
	import { studioTexture } from '../game/studioVisuals';
	const { tint }: { tint: number } = $props();
	const context = getContext();
	const board = $derived(context.stateGameDerived.boardLayout());
	const assets = $derived(context.stateApp.loadedAssets);
	const frame = $derived(studioTexture(assets, 'board-frame'));
	const recess = $derived(studioTexture(assets, 'practice-reel-recess'));
	const width = $derived(board.width / GOLF_FRAME_PANEL.width);
	const height = $derived(board.height / GOLF_FRAME_PANEL.height);
</script>

<Container x={board.x} y={board.y} scale={board.scale}>
	<BaseSprite
		texture={frame}
		label="Reel frame"
		{tint}
		anchor={GOLF_FRAME_PANEL.center}
		{width}
		{height}
	/>
	<BaseSprite
		texture={recess}
		label="Reel recess lighting"
		{tint}
		anchor={GOLF_FRAME_PANEL.center}
		{width}
		{height}
	/>
</Container>
