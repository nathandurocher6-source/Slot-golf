<script lang="ts">
	import { BaseSprite } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { getPracticeLayout } from '../game/practiceLayout';
	import type { PracticeLighting } from '../game/practiceLighting';
	import { PRACTICE_PLANES } from '../game/practicePlanes';
	import { studioTexture } from '../game/studioVisuals';
	import GolferStation from './GolferStation.svelte';

	const { lighting }: { lighting: PracticeLighting } = $props();
	const context = getContext();
	const layout = $derived(getPracticeLayout(context.stateLayoutDerived.canvasSizes()));
	const assets = $derived(context.stateApp.loadedAssets);
	const platform = $derived(
		studioTexture(
			assets,
			layout.portraitPhone ? 'practice-platform-portrait' : 'practice-platform',
		),
	);
	const shadow = $derived(studioTexture(assets, 'practice-contact-shadow'));
	const platformShadow = $derived(studioTexture(assets, 'practice-platform-shadow'));
	const platformLight = $derived(studioTexture(assets, 'practice-platform-light'));
	const dispenser = $derived(studioTexture(assets, 'ball-dispenser'));
	const dispenserScale = $derived(
		Math.max(
			0,
			Math.min(
				layout.dispenser.maxHeight / dispenser.height,
				(layout.dispenser.right - layout.dispenser.left) / dispenser.width,
			),
		),
	);
	const dispenserWidth = $derived(dispenser.width * dispenserScale);
</script>

{#if layout.portraitPhone}
	<BaseSprite
		texture={shadow}
		label="Platform contact shadow"
		anchor={0.5}
		x={layout.frameX}
		y={layout.floor + layout.platformHeight * 0.06}
		width={layout.platformWidth * 1.04}
		height={28}
		tint={lighting.terrace}
		alpha={0.92 * lighting.shadowStrength}
		zIndex={PRACTICE_PLANES.deckShadow}
	/>
{:else}
	<BaseSprite
		texture={platformShadow}
		label="Platform contact shadow"
		anchor={{ x: 0.5, y: 12 / 74 }}
		x={layout.frameX}
		y={layout.floor - layout.platformHeight * layout.platformFloor}
		width={layout.platformWidth * (672 / 640)}
		height={layout.platformHeight * (74 / 50)}
		tint={lighting.terrace}
		alpha={0.8 * lighting.shadowStrength}
		zIndex={PRACTICE_PLANES.deckShadow}
	/>
{/if}
<BaseSprite
	texture={platform}
	label="Practice platform"
	anchor={{ x: 0.5, y: layout.platformFloor }}
	x={layout.frameX}
	y={layout.floor}
	width={layout.platformWidth}
	height={layout.platformHeight}
	tint={lighting.platform}
	zIndex={PRACTICE_PLANES.deck}
/>
{#if !layout.portraitPhone}
	<BaseSprite
		texture={platformLight}
		label="Platform surface lighting"
		anchor={{ x: 0.5, y: layout.platformFloor }}
		x={layout.frameX}
		y={layout.floor}
		width={layout.platformWidth}
		height={layout.platformHeight}
		tint={lighting.platform}
		zIndex={PRACTICE_PLANES.deckLight}
	/>
{/if}
<BaseSprite
	texture={shadow}
	label="Reel frame contact shadow"
	anchor={0.5}
	x={layout.frameX + layout.frameWidth * 0.012}
	y={layout.frameFoot + layout.frameWidth * 0.006}
	width={layout.frameWidth * 1.06}
	height={layout.frameWidth * 0.054}
	tint={layout.portrait && !layout.portraitPhone ? lighting.terrace : lighting.contact}
	alpha={0.86 * lighting.shadowStrength}
	zIndex={PRACTICE_PLANES.contacts}
/>
<BaseSprite
	texture={shadow}
	label="Dispenser contact shadow"
	anchor={0.5}
	x={layout.dispenser.right - dispenserWidth * 0.475}
	y={layout.floor + dispenserWidth * 0.007}
	width={dispenserWidth * 1.14}
	height={dispenserWidth * 0.14}
	tint={lighting.contact}
	alpha={0.94 * lighting.shadowStrength}
	zIndex={PRACTICE_PLANES.contacts}
/>
<BaseSprite
	texture={dispenser}
	label="Practice ball dispenser"
	anchor={{ x: 1, y: 0.998 }}
	x={layout.dispenser.right}
	y={layout.floor}
	scale={dispenserScale}
	tint={lighting.scenery}
	zIndex={PRACTICE_PLANES.props}
/>
<GolferStation
	x={layout.golfer.left}
	floor={layout.floor}
	maxWidth={layout.golfer.right - layout.golfer.left}
	maxHeight={layout.golfer.maxHeight}
	{lighting}
/>
