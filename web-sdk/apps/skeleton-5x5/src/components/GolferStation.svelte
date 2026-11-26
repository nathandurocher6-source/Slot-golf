<script lang="ts">
	import { onDestroy } from 'svelte';
	import { BaseSprite, Container, PIXI } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { PRACTICE_ART } from '../game/practiceLayout';
	import type { PracticeLighting } from '../game/practiceLighting';
	import { studioTexture } from '../game/studioVisuals';

	type Props = {
		x: number;
		floor: number;
		maxWidth: number;
		maxHeight: number;
		lighting: PracticeLighting;
	};
	const { x, floor, maxWidth, maxHeight, lighting }: Props = $props();
	const { stateApp } = getContext();
	const assets = stateApp.loadedAssets;
	const golfer = studioTexture(assets, 'golfer-address');
	const ball = studioTexture(assets, 'golf-ball');
	const socket = studioTexture(assets, 'tee-socket');
	const tee = studioTexture(assets, 'retractable-tee');
	const shadow = studioTexture(assets, 'practice-contact-shadow');

	// The socket hides the lower shaft. The cropped view shares the original GPU texture.
	const exposedTee = new PIXI.Texture({
		source: tee.source,
		frame: new PIXI.Rectangle(
			tee.frame.x,
			tee.frame.y,
			tee.frame.width,
			tee.frame.height * PRACTICE_ART.tee.exposed,
		),
	});
	onDestroy(() => exposedTee.destroy(false));

	// Station coordinates use the golfer texture's native pixels, with the sole on y=0.
	const height = golfer.height;
	const golferTop = -height * PRACTICE_ART.golfer.shoes;
	const driverFace = {
		x: golfer.width * PRACTICE_ART.golfer.driverFaceX,
		y: golferTop + height * PRACTICE_ART.golfer.driverFaceY,
	};
	const ballWidth = height * 0.059;
	const ballHeight = (ballWidth * ball.height) / ball.width;
	const socketWidth = ballWidth * 1.79;
	const socketHeight = (socketWidth * socket.height) / socket.width;
	const teeWidth = ballWidth * 0.74;
	const teeHeight = (teeWidth * exposedTee.height) / exposedTee.width;
	const socketCenter = { x: driverFace.x + ballWidth * 0.59, y: driverFace.y + height * 0.052 };
	const ballContact = {
		x: socketCenter.x,
		y: socketCenter.y - teeHeight + ((teeWidth * tee.height) / tee.width) * PRACTICE_ART.tee.seat,
	};
	const stationWidth = socketCenter.x + socketWidth * (1 - PRACTICE_ART.socket.holeX);
	const scale = $derived(Math.max(0, Math.min(maxWidth / stationWidth, maxHeight / height)));
</script>

<Container {x} y={floor} {scale} zIndex={-3} label="GolferStation">
	{@render shoeShadow(0.45, 0.953, 0.31, 'Rear shoe contact shadow')}
	{@render shoeShadow(0.141, 0.99, 0.32, 'Front shoe contact shadow')}
	<BaseSprite texture={golfer} label="Golfer at address" y={golferTop} tint={lighting.scenery} />
	<BaseSprite
		texture={socket}
		label="Tee socket"
		tint={lighting.scenery}
		anchor={{ x: PRACTICE_ART.socket.holeX, y: PRACTICE_ART.socket.holeY }}
		x={socketCenter.x}
		y={socketCenter.y}
		width={socketWidth}
		height={socketHeight}
	/>
	<BaseSprite
		texture={exposedTee}
		label="Retractable tee"
		tint={lighting.scenery}
		anchor={{ x: PRACTICE_ART.tee.shaftX, y: 1 }}
		x={socketCenter.x}
		y={socketCenter.y}
		width={teeWidth}
		height={teeHeight}
	/>
	<BaseSprite
		texture={ball}
		label="Ball on tee"
		tint={lighting.scenery}
		anchor={{ x: 0.5, y: 1 }}
		x={ballContact.x}
		y={ballContact.y}
		width={ballWidth}
		height={ballHeight}
	/>
</Container>

{#snippet shoeShadow(x: number, y: number, width: number, label: string)}
	<BaseSprite
		texture={shadow}
		{label}
		anchor={0.5}
		x={golfer.width * x}
		y={golferTop + height * y}
		width={golfer.width * width}
		height={height * 0.044}
		tint={lighting.contact}
		alpha={0.86 * lighting.shadowStrength}
	/>
{/snippet}
