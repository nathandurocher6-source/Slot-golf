<script lang="ts" module>
	export type EmitterEventBoardFrame =
		| { type: 'boardFrameGlowShow' }
		| { type: 'boardFrameGlowHide' };
</script>

<script lang="ts">
	import { Container, BaseSprite, type LoadedSprite } from 'pixi-svelte';
	import { getContext } from '../game/context';

	const context = getContext();
	const boardLayout = $derived(context.stateGameDerived.boardLayout());
	const frame = $derived(context.stateApp.loadedAssets['board-frame'] as LoadedSprite | undefined);
	let glowActive = $state(false);

	context.eventEmitter.subscribeOnMount({
		boardFrameGlowShow: () => (glowActive = true),
		boardFrameGlowHide: () => (glowActive = false),
	});

	// Align the printed columns inside the PNG with the five symbol columns.
	const panelWidthRatio = 0.78;
	const panelHeightRatio = 0.74;
	const panelCenter = { x: 0.5, y: 0.527 };
</script>

{#if frame}
	<Container x={boardLayout.x} y={boardLayout.y} scale={boardLayout.scale ?? 1}>
		<BaseSprite
			texture={frame}
			anchor={panelCenter}
			width={boardLayout.width / panelWidthRatio}
			height={boardLayout.height / panelHeightRatio}
		/>
		{#if glowActive}
			<BaseSprite
				texture={frame}
				anchor={panelCenter}
				width={boardLayout.width / panelWidthRatio}
				height={boardLayout.height / panelHeightRatio}
				tint={0xffdb79}
				alpha={0.35}
				blendMode="add"
			/>
		{/if}
	</Container>
{/if}
