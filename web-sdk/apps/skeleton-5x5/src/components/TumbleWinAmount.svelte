<script lang="ts" module>
	export type EmitterEventTumbleWinAmount =
		| { type: 'tumbleWinAmountShow' }
		| { type: 'tumbleWinAmountHide' }
		| { type: 'tumbleWinAmountReset' }
		| {
				type: 'tumbleWinAmountUpdate';
				amount: number;
				baseAmount?: number;
				multiplier?: number;
				animate?: boolean;
		  };
</script>

<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { Tween } from 'svelte/motion';
	import { backOut, cubicOut } from 'svelte/easing';
	import { Container, BaseSprite, PIXI } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { stateBet } from 'state-shared';
	import { onDestroy } from 'svelte';
	import { animationDelay } from '../game/animationDelay';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import StudioText from './StudioText.svelte';
	import { getContext } from '../game/context';
	import { isCelebrationWin } from '../game/studioVisuals';
	import { getPracticeLayout } from '../game/practiceLayout';

	const context = getContext();
	const reduceMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	const sizes = $derived(context.stateLayoutDerived.canvasSizes());
	const practice = $derived(getPracticeLayout(sizes));
	const width = $derived(Math.min(234, sizes.width * (practice.portrait ? 0.46 : 0.4)));
	const height = $derived(Math.min(43, Math.max(24, practice.hudTop - practice.floor - 10)));
	const x = $derived(practice.frameX);
	const y = $derived((practice.floor + practice.hudTop) / 2);

	let show = $state(false);
	let amount = $state(0);
	let equation = $state<{ base: number; multiplier: number }>();
	let animation: AbortController | undefined;
	const displayed = new Tween(0);
	const bounce = new Tween(1);

	function updateDisplay(value: number, duration: number) {
		void displayed.set(value, { duration: reduceMotion.current ? 0 : duration, easing: cubicOut });
		if (reduceMotion.current) return;
		void bounce.set(isCelebrationWin(value) ? 0.91 : 0.96, { duration: 0 });
		void bounce.set(1, { duration: 200, easing: backOut });
	}

	function hide() {
		animation?.abort();
		animation = undefined;
		show = false;
		void bounce.set(1, { duration: 0 });
	}

	function clear() {
		hide();
		amount = 0;
		equation = undefined;
		void displayed.set(0, { duration: 0 });
	}

	context.eventEmitter.subscribeOnMount({
		tumbleWinAmountShow: () => (show = true),
		tumbleWinAmountHide: hide,
		tumbleWinAmountReset: clear,
		freeSpinIntroShow: clear,
		freeSpinOutroShow: clear,
		tumbleWinAmountUpdate: async (event) => {
			animation?.abort();
			const { signal } = (animation = new AbortController());
			amount = event.amount;
			if (event.baseAmount && event.multiplier && event.multiplier > 1) {
				equation = { base: event.baseAmount, multiplier: event.multiplier };
				context.eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_update' });
				if (!(await animationDelay(stateBet.isTurbo ? 500 : 950, signal))) return;
			}
			equation = undefined;
			updateDisplay(event.amount, event.animate ? 200 : stateBet.isTurbo ? 80 : 140);
			if (event.animate) await animationDelay(200, signal);
		},
	});
	onDestroy(clear);
</script>

{#if amount > 0}
	<FadeContainer {show} {x} {y} duration={145} label="Cluster payout plaque">
		<Container scale={bounce.current}>
			<BaseSprite
				texture={PIXI.Texture.WHITE}
				tint={0x183826}
				alpha={0.96}
				anchor={0.5}
				width={Math.max(0, width)}
				{height}
			/>
			<StudioText
				text={equation ? 'MULTIPLIER' : 'CLUSTER WIN'}
				y={-height * 0.2}
				size={Math.min(10, height * 0.3)}
				tint={0xd2ecaa}
			/>
			<StudioText
				text={equation
					? `${bookEventAmountToCurrencyString(equation.base)} × ${equation.multiplier}`
					: bookEventAmountToCurrencyString(Math.round(displayed.current))}
				y={height * 0.18}
				size={Math.min(18, height * 0.48)}
				maxWidth={width * 0.83}
				tint={isCelebrationWin(amount) ? 0xffdb71 : 0xfff6dd}
			/>
		</Container>
	</FadeContainer>
{/if}
