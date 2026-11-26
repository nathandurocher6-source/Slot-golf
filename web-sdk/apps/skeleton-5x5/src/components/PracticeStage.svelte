<script lang="ts">
	import { BaseSprite } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { getPracticeLayout, PRACTICE_ART } from '../game/practiceLayout';
	import type { PracticeLighting } from '../game/practiceLighting';
	import { studioTexture } from '../game/studioVisuals';
	import GolferStation from './GolferStation.svelte';

	const { lighting }: { lighting: PracticeLighting } = $props();
	const context = getContext();
	const layout = $derived(getPracticeLayout(context.stateLayoutDerived.canvasSizes()));
	const assets = $derived(context.stateApp.loadedAssets);
	const platform = $derived(studioTexture(assets, 'practice-platform'));
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

<BaseSprite
	texture={platformShadow}
	label="Platform contact shadow"
	anchor={{ x: 0.5, y: 12 / 74 }}
	x={layout.frameX}
	y={layout.floor - layout.platformHeight * PRACTICE_ART.platform.floor}
	width={layout.platformWidth * (672 / 640)}
	height={layout.platformHeight * (74 / 50)}
	tint={lighting.terrace}
	alpha={0.8 * lighting.shadowStrength}
	zIndex={-6}
/>
<BaseSprite
	texture={platform}
	label="Practice platform"
	anchor={{ x: 0.5, y: PRACTICE_ART.platform.floor }}
	x={layout.frameX}
	y={layout.floor}
	width={layout.platformWidth}
	height={layout.platformHeight}
	tint={lighting.platform}
	zIndex={-5}
/>
<BaseSprite
	texture={platformLight}
	label="Platform surface lighting"
	anchor={{ x: 0.5, y: PRACTICE_ART.platform.floor }}
	x={layout.frameX}
	y={layout.floor}
	width={layout.platformWidth}
	height={layout.platformHeight}
	tint={lighting.platform}
	zIndex={-4}
/>
<BaseSprite
	texture={shadow}
	label="Reel frame contact shadow"
	anchor={0.5}
	x={layout.frameX + layout.frameWidth * 0.012}
	y={layout.frameFoot + layout.frameWidth * 0.006}
	width={layout.frameWidth * 1.06}
	height={layout.frameWidth * 0.054}
	tint={layout.portrait ? lighting.terrace : lighting.contact}
	alpha={0.86 * lighting.shadowStrength}
	zIndex={-3}
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
	zIndex={-3}
/>
<BaseSprite
	texture={dispenser}
	label="Practice ball dispenser"
	anchor={{ x: 1, y: 0.998 }}
	x={layout.dispenser.right}
	y={layout.floor}
	scale={dispenserScale}
	tint={lighting.scenery}
	zIndex={-2}
/>
<GolferStation
	x={layout.golfer.left}
	floor={layout.floor}
	maxWidth={layout.golfer.right - layout.golfer.left}
	maxHeight={layout.golfer.maxHeight}
	{lighting}
/>
