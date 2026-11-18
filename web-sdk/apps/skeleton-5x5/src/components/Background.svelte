<script lang="ts">
	import { BaseSprite, PIXI, type LoadedSprite } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { SECOND } from 'constants-shared/time';
	import { getContext } from '../game/context';

	const context = getContext();
	const canvasSizes = $derived(context.stateLayoutDerived.canvasSizes());
	const background = $derived(context.stateApp.loadedAssets.background as LoadedSprite | undefined);
	const showFeatureBackground = $derived(context.stateGame.gameType === 'freegame');
	const coverScale = $derived(
		background
			? Math.max(canvasSizes.width / background.width, canvasSizes.height / background.height)
			: 1,
	);
</script>

{#if background}
	{#snippet course(tint: number)}
		<BaseSprite
			texture={background}
			anchor={0.5}
			x={canvasSizes.width / 2}
			y={canvasSizes.height / 2}
			scale={coverScale}
			{tint}
		/>
	{/snippet}

	<FadeContainer show duration={SECOND * 0.5} zIndex={-5}>
		{@render course(0xffffff)}
	</FadeContainer>
	<FadeContainer show={showFeatureBackground} duration={SECOND * 0.5} zIndex={-4}>
		{@render course(0x687ca0)}
	</FadeContainer>
{:else}
	<BaseSprite texture={PIXI.Texture.WHITE} tint={0x07150e} {...canvasSizes} zIndex={-6} />
{/if}
