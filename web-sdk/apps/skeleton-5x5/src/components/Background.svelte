<script lang="ts">
	import { BaseSprite, PIXI } from 'pixi-svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { getContext } from '../game/context';
	import { getPracticeBackdrop } from '../game/practiceLayout';
	import { studioTexture } from '../game/studioVisuals';
	import PracticeBackdropParallax from './PracticeBackdropParallax.svelte';

	const { sunset }: { sunset: number } = $props();
	const context = getContext();
	const parallax = new MediaQuery(
		'(min-width: 960px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
	);
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

{#if parallax.current}
	<PracticeBackdropParallax {day} {night} {sunset} {projection} screenWidth={sizes.width} />
{:else}
	{@render backdrop(day, 1, -8, 'Day course', sunset < 1)}
	{@render backdrop(night, sunset, -7, 'Sunset course', sunset > 0)}
{/if}
