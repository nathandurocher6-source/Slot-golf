<script lang="ts" module>
	export type EmitterEventBonusMarquee =
		| { type: 'freeSpinCounterShow' }
		| { type: 'freeSpinCounterHide' }
		| { type: 'freeSpinCounterUpdate'; current?: number; total?: number }
		| { type: 'globalMultiplierShow' }
		| { type: 'globalMultiplierHide' }
		| { type: 'globalMultiplierUpdate'; multiplier: number };
</script>

<script lang="ts">
	import { BaseSprite, Container, PIXI } from 'pixi-svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { Tween } from 'svelte/motion';
	import { backOut, cubicOut } from 'svelte/easing';
	import { onDestroy } from 'svelte';
	import { animationDelay } from '../game/animationDelay';
	import { getContext } from '../game/context';
	import { getFrameOnScreen } from '../game/studioVisuals';
	import { GOLF_FRAME_PANEL } from '../game/golfAssets';
	import StudioText from './StudioText.svelte';

	const { visible }: { visible: boolean } = $props();
	const context = getContext();
	const reduceMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	const board = $derived(
		getFrameOnScreen(
			context.stateLayoutDerived.mainLayout(),
			context.stateGameDerived.boardLayout(),
		),
	);

	const width = $derived(Math.min(147, Math.max(88, (board.right - board.left) * 0.44)));
	const height = $derived(Math.max(32, width * 0.31));
	const offset = $derived(width / 2 + 2);
	const panelTop = $derived(
		board.centerY - ((board.bottom - board.top) * GOLF_FRAME_PANEL.height) / 2,
	);
	const y = $derived(Math.max(height / 2 + 5, panelTop - height * 0.53));

	const pulse = new Tween(1);
	let show = $state(false);
	let current = $state(0);
	let total = $state(0);
	let multiplier = $state(1);
	const remaining = $derived(Math.max(total - current, 0));

	let animation: AbortController | undefined;
	function stopPulse() {
		animation?.abort();
		animation = undefined;
		void pulse.set(1, { duration: 0 });
	}

	function reset() {
		stopPulse();
		show = false;
		current = 0;
		total = 0;
		multiplier = 1;
	}

	context.eventEmitter.subscribeOnMount({
		freeSpinIntroShow: reset,
		freeSpinCounterShow: () => (show = true),
		freeSpinCounterHide: reset,
		freeSpinCounterUpdate: (event) => {
			if (event.current !== undefined) current = event.current;
			if (event.total !== undefined) total = event.total;
		},
		globalMultiplierHide: stopPulse,
		globalMultiplierUpdate: async (event) => {
			const increased = event.multiplier > multiplier;
			multiplier = event.multiplier;
			stopPulse();
			const { signal } = (animation = new AbortController());
			if (increased) {
				context.eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_update' });
				const animate = visible && !reduceMotion.current;
				if (animate) void pulse.set(1.13, { duration: 140, easing: cubicOut });
				if (!(await animationDelay(140, signal))) return;
				if (animate) void pulse.set(1, { duration: 180, easing: backOut });
				if (!(await animationDelay(180, signal))) return;
			}
			await animationDelay(100, signal);
		},
	});

	onDestroy(stopPulse);
</script>

{#snippet scorePlate()}
	<BaseSprite texture={PIXI.Texture.WHITE} tint={0xb69b54} anchor={0.5} {width} {height} />
	<BaseSprite
		texture={PIXI.Texture.WHITE}
		tint={0x173627}
		anchor={0.5}
		width={width - 2}
		height={height - 2}
	/>
{/snippet}

{#if show && visible}
	<Container x={board.centerX} {y} zIndex={20} label="Championship scoreboard">
		<Container x={-offset}>
			{@render scorePlate()}
			<StudioText
				text="FREE SPINS LEFT"
				y={-height * 0.2}
				size={11}
				maxWidth={width * 0.77}
				tint={0xc0f19c}
			/>
			<StudioText text={String(remaining)} y={height * 0.16} size={height * 0.49} tint={0xffdf75} />
		</Container>
		<Container x={offset} scale={pulse.current}>
			{@render scorePlate()}
			<StudioText
				text="GLOBAL MULTIPLIER"
				y={-height * 0.2}
				size={11}
				maxWidth={width * 0.77}
				tint={0xc0f19c}
			/>
			<StudioText
				text={`×${multiplier}`}
				y={height * 0.16}
				size={height * 0.49}
				maxWidth={width * 0.77}
				tint={0xffe793}
			/>
		</Container>
	</Container>
{/if}
