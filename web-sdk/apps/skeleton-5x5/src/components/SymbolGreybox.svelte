<script lang="ts">
	import { untrack } from 'svelte';
	import {
		BaseSprite,
		PIXI,
		createContextParent,
		getContextApp,
		getContextParent,
	} from 'pixi-svelte';
	import { Tween } from 'svelte/motion';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { stateBet } from 'state-shared';
	import { SYMBOL_SIZE } from '../game/constants';
	import type { RawSymbol, SymbolState } from '../game/types';
	import { getMultiplierLabelTexture, getSymbolTexture } from '../game/symbolTextureCache';
	import { SYMBOL_MOTION } from '../game/symbolMotion';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		travel?: Tween<number>;
		motionSeed?: number;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();

	const { stateApp } = getContextApp();
	const isMultiplier = $derived(props.rawSymbol.name === 'M');
	const isWinning = $derived(props.state === 'win' || props.state === 'postWinStatic');
	const symbolTexture = $derived(getSymbolTexture(stateApp.loadedAssets, props.rawSymbol.name));
	const multiplier = $derived(props.rawSymbol.multiplier ?? 2);
	const motion = $derived(SYMBOL_MOTION[props.rawSymbol.name]);

	const scale = new Tween(1);
	const alpha = new Tween(1);
	const impact = new Tween(0);
	const tile = new PIXI.Container();
	getContextParent().addToParent(tile);
	createContextParent(tile);

	const trajectory = $derived.by(() => {
		const travel = props.travel;
		if (!travel) return;
		const end = travel.target;
		return { start: untrack(() => travel.current), end };
	});
	const fallProgress = $derived.by(() => {
		if (!trajectory || !props.travel || (props.state !== 'spin' && props.state !== 'static'))
			return 0;
		const distance = trajectory.end - trajectory.start;
		const covered = props.travel.current - trajectory.start;
		if (distance <= 0 || covered <= 0 || covered >= distance) return 0;
		return covered / distance;
	});
	const motionSeed = $derived(Math.abs(props.motionSeed ?? 0));

	$effect(() => {
		const s = props.state;
		const isTurbo = untrack(() => stateBet.isTurbo);
		let active = true;
		void impact.set(0, { duration: 0 });

		async function play() {
			switch (s) {
				case 'win': {
					const targetScale = untrack(() => isMultiplier) ? 1.25 : 1.18;
					await scale.set(targetScale, { duration: isTurbo ? 60 : 120, easing: cubicOut });
					if (!active) return;
					await scale.set(1.02, { duration: isTurbo ? 50 : 100, easing: cubicIn });
					break;
				}
				case 'explosion': {
					await scale.set(1.3, { duration: isTurbo ? 35 : 70, easing: cubicOut });
					if (!active) return;
					const duration = isTurbo ? 65 : 130;
					await Promise.all([
						scale.set(0, { duration, easing: cubicIn }),
						alpha.set(0, { duration, easing: cubicIn }),
					]);
					break;
				}
				case 'land': {
					void scale.set(1, { duration: 0 });
					void alpha.set(1, { duration: 0 });
					await impact.set(0.36, { duration: isTurbo ? 30 : 60 });
					if (!active) return;
					await impact.set(1, { duration: isTurbo ? 45 : 90 });
					break;
				}
				case 'spin':
					void scale.set(0.95, { duration: isTurbo ? 25 : 50 });
					void alpha.set(0.85, { duration: isTurbo ? 25 : 50 });
					return;
				default:
					void scale.set(1, { duration: isTurbo ? 25 : 60 });
					void alpha.set(1, { duration: isTurbo ? 25 : 60 });
					return;
			}
			if (active) props.oncomplete?.();
		}

		void play();
		return () => {
			active = false;
			void scale.set(scale.current, { duration: 0 });
			void alpha.set(alpha.current, { duration: 0 });
			void impact.set(0, { duration: 0 });
		};
	});

	$effect(() => {
		const p = props.state === 'land' ? impact.current : 0;
		const settle = Math.max(0, (p - 0.26) / 0.74);
		const decay = (1 - settle) ** 2;
		const compression = p < 0.26 ? p / 0.26 : (1 - settle) ** 5;
		const rebound = Math.sin(Math.PI * settle) * (1 - 0.38 * settle);
		// One small counter-lean after impact, damped toward zero. The tile
		// stays in its column throughout the entire fall and rebound.
		const counterLean = Math.sin(2 * Math.PI * settle) * decay;
		const direction = motionSeed % 2 ? 1 : -1;
		const variation = 0.95 + (motionSeed % 5) * 0.025;
		const t = fallProgress;
		const fall = Math.sin(Math.PI * t) * (0.58 + 0.7 * t);
		const distance = trajectory ? trajectory.end - trajectory.start : 0;
		// The sprite lags then catches the original Tween. Logical positions and durations
		// still come entirely from the reel and cascade controllers.
		const fallLag = t * (1 - t) * Math.min(distance * 0.7, SYMBOL_SIZE * 0.85);
		const verticalSquash = variation * motion.squash * compression;
		const impactOffset = (TILE_SIZE / 2) * verticalSquash;

		tile.position.set(
			props.x ?? 0,
			(props.y ?? 0) + impactOffset - fallLag - SYMBOL_SIZE * variation * motion.rebound * rebound,
		);
		tile.scale.set(
			scale.current * (1 + verticalSquash * 0.48 - motion.stretch * 0.28 * fall),
			scale.current * (1 - verticalSquash + variation * motion.stretch * (fall + rebound * 0.32)),
		);
		tile.rotation =
			direction * variation * motion.tilt * (fall + 0.48 * compression - 0.56 * counterLean);
		tile.alpha = alpha.current;
	});

	const TILE_SIZE = 94;
</script>

<BaseSprite
	texture={symbolTexture}
	label="Golf symbol"
	tint={isWinning ? 0xffedc8 : 0xffffff}
	anchor={0.5}
	width={TILE_SIZE}
	height={TILE_SIZE}
/>
{#if isMultiplier}
	<BaseSprite
		texture={getMultiplierLabelTexture(multiplier)}
		anchor={0.5}
		width={72}
		height={31.5}
	/>
{/if}
