<script lang="ts">
	import { BaseSprite, PIXI } from 'pixi-svelte';
	import { getContext } from '../game/context';

	type Props = { tint?: number; alpha?: number; zIndex?: number; onpress?: () => void };
	const { tint = 0xffffff, alpha = 1, zIndex, onpress }: Props = $props();
	const context = getContext();
	const sizes = $derived(context.stateLayoutDerived.canvasSizes());
</script>

<BaseSprite
	texture={PIXI.Texture.WHITE}
	{...sizes}
	{tint}
	{alpha}
	{zIndex}
	eventMode={onpress ? 'static' : 'none'}
	cursor={onpress ? 'pointer' : undefined}
	onpointerup={onpress}
/>
