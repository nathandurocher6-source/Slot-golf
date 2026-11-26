<script lang="ts">
	import { onMount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { Tween } from 'svelte/motion';
	import { backOut, cubicOut } from 'svelte/easing';
	import { Container } from 'pixi-svelte';
	import { OnHotkey } from 'components-shared';
	import { stateBet } from 'state-shared';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { getContext } from '../game/context';
	import { getFrameOnScreen } from '../game/studioVisuals';
	import ScreenSprite from './ScreenSprite.svelte';
	import StudioCard from './StudioCard.svelte';

	type Props = { type: 'intro' | 'result'; amount: number; oncomplete: () => void };
	const { type, amount, oncomplete }: Props = $props();
	const context = getContext();
	const reduceMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	const sizes = $derived(context.stateLayoutDerived.canvasSizes());
	const board = $derived(
		getFrameOnScreen(
			context.stateLayoutDerived.mainLayout(),
			context.stateGameDerived.boardLayout(),
		),
	);

	const width = $derived(Math.min(520, sizes.width - 20, sizes.height * 1.3));
	const scale = new Tween(0.82);
	const count = new Tween(0);
	let complete = false;

	const finish = () => {
		if (complete) return;
		complete = true;
		oncomplete();
	};

	onMount(() => {
		const isAuto = context.stateXstateDerived.isAutoBetting();
		const duration =
			type === 'intro'
				? stateBet.isTurbo
					? 350
					: isAuto
						? 750
						: 2500
				: stateBet.isTurbo
					? 450
					: isAuto
						? 1000
						: 3000;
		void scale.set(1, { duration: reduceMotion.current ? 0 : 190, easing: backOut });
		if (type === 'result')
			void count.set(amount, {
				duration: reduceMotion.current ? 0 : duration * 0.62,
				easing: cubicOut,
			});
		const timer = setTimeout(finish, duration);
		return () => {
			clearTimeout(timer);
			void scale.set(scale.current, { duration: 0 });
			void count.set(count.current, { duration: 0 });
		};
	});
</script>

<ScreenSprite tint={0x14271e} alpha={0.47} zIndex={120} onpress={finish} />
<OnHotkey hotkey="Space" onpress={finish} />
<OnHotkey hotkey="Enter" onpress={finish} />
<OnHotkey hotkey="Escape" onpress={finish} />

<Container
	x={board.centerX}
	y={board.centerY}
	zIndex={121}
	scale={scale.current}
	eventMode="none"
	label={`Free spins ${type}`}
>
	<StudioCard
		{width}
		title={type === 'intro' ? 'FREE SPINS' : 'FREE SPINS COMPLETE'}
		value={type === 'intro'
			? `${amount}`
			: bookEventAmountToCurrencyString(Math.round(count.current))}
		detail={type === 'intro' ? 'WITH PROGRESSIVE MULTIPLIERS' : 'TOTAL FREE SPINS WIN'}
		prompt="TAP TO CONTINUE"
	/>
</Container>
