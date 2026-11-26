<script lang="ts" module>
	export type RawWin = {
		win: number;
		mult: number;
		result: number;
		reel: number;
		row: number;
	};
	export type Win = RawWin & { oncomplete: () => void };
</script>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { backOut, cubicOut } from 'svelte/easing';
	import { BaseSprite, Container, PIXI } from 'pixi-svelte';
	import StudioText from './StudioText.svelte';
	import { stateBetDerived } from 'state-shared';
	import { SECOND } from 'constants-shared/time';
	import { FadeContainer } from 'components-pixi';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { SYMBOL_SIZE } from '../game/constants';
	import { isCelebrationWin } from '../game/studioVisuals';

	type Props = { win: Win };

	const props: Props = $props();
	const y = new Tween(0);
	const scale = new Tween(0.3);
	let show = $state(true);

	const PILL_WIDTH = $derived(props.win.result >= 10000 ? 104 : 88);
	const PILL_HEIGHT = 30;

	let isCompleted = false;
	const completeOnce = () => {
		if (!isCompleted) {
			isCompleted = true;
			props.win.oncomplete();
		}
	};

	onMount(async () => {
		const timeScale = stateBetDerived.timeScale() || 1;
		const totalDuration = (SECOND * (isCelebrationWin(props.win.result) ? 0.82 : 0.53)) / timeScale;

		// Pop-in scale animation
		scale.set(1.28, { duration: 110 / timeScale, easing: backOut }).then(() => {
			scale.set(1.0, { duration: 90 / timeScale, easing: cubicOut });
		});

		// Float-up animation
		await y.set(-SYMBOL_SIZE * 0.58, { duration: totalDuration, easing: cubicOut });
		show = false;
	});

	onDestroy(() => {
		completeOnce();
	});
</script>

<FadeContainer
	{show}
	oncomplete={() => {
		if (!show) completeOnce();
	}}
>
	<Container
		x={SYMBOL_SIZE * (props.win.reel + 0.5)}
		y={SYMBOL_SIZE * (props.win.row - 0.5) + y.current}
		scale={{ x: scale.current, y: scale.current }}
		zIndex={150}
	>
		<BaseSprite
			texture={PIXI.Texture.WHITE}
			tint={0x183826}
			alpha={0.96}
			width={PILL_WIDTH}
			height={PILL_HEIGHT}
			anchor={0.5}
		/>
		<StudioText
			y={1}
			text={bookEventAmountToCurrencyString(props.win.result)}
			size={15}
			maxWidth={PILL_WIDTH * 0.83}
			tint={0xffea79}
		/>
	</Container>
</FadeContainer>
