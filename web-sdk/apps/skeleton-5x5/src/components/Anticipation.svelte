<script lang="ts">
	import { BaseSprite, Container, PIXI } from 'pixi-svelte';
	import { Tween } from 'svelte/motion';
	import { getContext } from '../game/context';
	import type { Reel } from '../game/stateGame.svelte';
	import { REEL_PADDING, SYMBOL_SIZE } from '../game/constants';

	type Props = {
		reel: Reel;
		oncomplete: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	const alpha = new Tween(0.65);

	$effect(() => {
		if (props.reel.reelState.motion === 'stopped') {
			alpha.set(0, { duration: 150 }).then(() => {
				props.oncomplete();
			});
		}
	});

	const boardLayout = $derived(context.stateGameDerived.boardLayout());
	const scale = $derived(boardLayout.scale ?? 1);
	const reelX = $derived(
		boardLayout.x +
			(-boardLayout.width * 0.5 + (props.reel.reelIndex + REEL_PADDING) * SYMBOL_SIZE) * scale,
	);
</script>

<Container x={reelX} y={boardLayout.y} {scale} alpha={alpha.current}>
	<BaseSprite
		texture={PIXI.Texture.WHITE}
		tint={0xffd983}
		alpha={0.32}
		width={SYMBOL_SIZE * 0.96}
		height={boardLayout.height}
		anchor={0.5}
	/>
</Container>
