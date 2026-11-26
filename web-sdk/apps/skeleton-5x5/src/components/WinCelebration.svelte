<script lang="ts">
	import { onMount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { Tween } from 'svelte/motion';
	import { backOut, cubicOut, linear } from 'svelte/easing';
	import { BaseSprite, Container } from 'pixi-svelte';
	import { OnHotkey } from 'components-shared';
	import { stateBet } from 'state-shared';
	import {
		bookEventAmountToBetAmountMultiplier,
		bookEventAmountToCurrencyString,
		numberToCurrencyString,
	} from 'utils-shared/amount';
	import { getContext } from '../game/context';
	import { getFrameOnScreen, getWinPresentation, studioTexture } from '../game/studioVisuals';
	import type { WinLevelData } from '../game/winLevelMap';
	import ScreenSprite from './ScreenSprite.svelte';
	import StudioText from './StudioText.svelte';

	type Props = {
		amount: number;
		betAmount?: number;
		winLevelData?: WinLevelData;
		isMaxWin?: boolean;
		oncomplete?: () => void;
	};
	const props: Props = $props();
	const context = getContext();
	const reduceMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	const sizes = $derived(context.stateLayoutDerived.canvasSizes());
	const board = $derived(
		getFrameOnScreen(
			context.stateLayoutDerived.mainLayout(),
			context.stateGameDerived.boardLayout(),
		),
	);
	const assets = $derived(context.stateApp.loadedAssets);
	const largestWin = $derived(
		Boolean(
			props.isMaxWin ||
				props.winLevelData?.alias === 'max' ||
				bookEventAmountToBetAmountMultiplier(props.amount) >= 100000,
		),
	);
	const theme = $derived(getWinPresentation(props.amount, largestWin));
	const width = $derived(Math.min(sizes.width - 22, sizes.height * 1.36, 520));
	const count = new Tween(0);
	const fade = new Tween(1);
	const cardScale = new Tween(0.7);
	let skipped = $state(false);
	let done = false;
	let timer: ReturnType<typeof setTimeout>;
	let fadeTimer: ReturnType<typeof setTimeout>;

	const amountValue = $derived(Math.round((skipped ? 1 : count.current) * props.amount));
	const formatted = $derived(
		props.betAmount === undefined
			? bookEventAmountToCurrencyString(amountValue)
			: numberToCurrencyString(bookEventAmountToBetAmountMultiplier(amountValue) * props.betAmount),
	);
	const banner = $derived(studioTexture(assets, theme.banner));
	const height = $derived((width * banner.height) / banner.width);
	const completed = $derived(skipped || count.current >= 1);

	let hold: number;

	function clearTimers() {
		clearTimeout(timer);
		clearTimeout(fadeTimer);
	}

	const finish = () => {
		if (done) return;
		done = true;
		clearTimers();
		props.oncomplete?.();
	};

	function scheduleExit(delay: number) {
		clearTimers();
		if (!reduceMotion.current) {
			const fadeDuration = Math.min(180, hold * 0.65);
			fadeTimer = setTimeout(
				() => void fade.set(0, { duration: fadeDuration, easing: linear }),
				delay - fadeDuration,
			);
		}
		timer = setTimeout(finish, delay);
	}

	const advance = () => {
		if (completed) finish();
		else {
			skipped = true;
			void count.set(1, { duration: 0 });
			scheduleExit(hold);
		}
	};

	onMount(() => {
		const pace = stateBet.isTurbo ? 0.48 : context.stateXstateDerived.isAutoBetting() ? 0.7 : 1;
		const duration = reduceMotion.current ? 100 : Math.round(theme.duration * pace);
		hold = Math.round(theme.hold * pace);
		void cardScale.set(1, { duration: reduceMotion.current ? 0 : 250 * pace, easing: backOut });
		void count.set(1, { duration, easing: cubicOut });
		scheduleExit(duration + hold);
		return () => {
			clearTimers();
			void cardScale.set(cardScale.current, { duration: 0 });
			void count.set(count.current, { duration: 0 });
			void fade.set(fade.current, { duration: 0 });
		};
	});
</script>

<ScreenSprite
	tint={0x14271e}
	alpha={(theme.banner === 'win' ? 0.23 : 0.42) * fade.current}
	zIndex={110}
	onpress={advance}
/>
<OnHotkey hotkey="Space" onpress={advance} />
<OnHotkey hotkey="Enter" onpress={advance} />

<Container
	x={board.centerX}
	y={board.centerY}
	scale={cardScale.current}
	alpha={fade.current}
	zIndex={111}
	eventMode="none"
	label={`Win banner ${theme.banner}`}
>
	<BaseSprite texture={banner} anchor={0.5} {width} {height} />
	<StudioText
		text={formatted}
		y={height * 0.28}
		size={width * 0.086}
		maxWidth={width * 0.49}
		tint={0xffe6a3}
	/>
	<StudioText
		text={completed ? 'TAP TO CONTINUE' : 'TAP TO SKIP'}
		y={height * 0.58}
		size={Math.min(14, width * 0.036)}
		maxWidth={width * 0.86}
	/>
</Container>
