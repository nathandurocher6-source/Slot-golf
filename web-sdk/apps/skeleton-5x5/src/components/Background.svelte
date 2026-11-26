<script lang="ts">
	import { BaseSprite, PIXI } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { getPracticeBackdrop } from '../game/practiceLayout';
	import { PRACTICE_PLANES } from '../game/practicePlanes';
	import { studioTexture } from '../game/studioVisuals';

	const { sunset }: { sunset: number } = $props();
	const context = getContext();
	const sizes = $derived(context.stateLayoutDerived.canvasSizes());
	const assets = $derived(context.stateApp.loadedAssets);
	const day = $derived(studioTexture(assets, 'background'));
	const night = $derived(studioTexture(assets, 'background-bonus'));
	const projection = $derived(getPracticeBackdrop(sizes, day));
</script>

{#snippet backdrop(
	texture: PIXI.Texture,
	alpha: number,
	zIndex: number,
	label: string,
	visible: boolean,
)}
	<BaseSprite {texture} {alpha} {zIndex} {label} {visible} anchor={0.5} {...projection} />
{/snippet}

{@render backdrop(day, 1, PRACTICE_PLANES.day, 'Day course', sunset < 1)}
{@render backdrop(night, sunset, PRACTICE_PLANES.sunset, 'Sunset course', sunset > 0)}
