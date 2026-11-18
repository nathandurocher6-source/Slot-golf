<script lang="ts">
	import { Container, BaseSprite, getContextApp } from 'pixi-svelte';
	import { Tween } from 'svelte/motion';
	import { backOut, cubicIn, cubicOut } from 'svelte/easing';
	import { stateBet } from 'state-shared';
	import type { RawSymbol, SymbolState } from '../game/types';
	import {
		getMultiplierAuraTexture,
		getMultiplierLabelTexture,
		getSymbolTexture,
	} from '../game/symbolTextureCache';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();

	const { stateApp } = getContextApp();
	const isMultiplier = $derived(props.rawSymbol.name === 'M');
	const isWinning = $derived(props.state === 'win' || props.state === 'postWinStatic');
	const symbolTexture = $derived(getSymbolTexture(stateApp.loadedAssets, props.rawSymbol.name));
	const multiplier = $derived(props.rawSymbol.multiplier ?? 2);
	const multiplierTint = $derived(multiplier >= 50 ? 0xff225e : multiplier >= 10 ? 0xfbbf24 : 0x00ff88);

	const scale = new Tween(1);
	const alpha = new Tween(1);

	$effect(() => {
		const s = props.state;
		const isTurbo = stateBet.isTurbo;

		if (s === 'win') {
			const sDur1 = isTurbo ? 60 : 120;
			const sDur2 = isTurbo ? 50 : 100;

			const targetScale = isMultiplier ? 1.25 : 1.18;
			scale
				.set(targetScale, { duration: sDur1, easing: cubicOut })
				.then(() => scale.set(1.02, { duration: sDur2, easing: cubicIn }))
				.then(() => {
					props.oncomplete?.();
				});
		} else if (s === 'explosion') {
			const eDur1 = isTurbo ? 35 : 70;
			const eDur2 = isTurbo ? 65 : 130;
			scale
				.set(1.3, { duration: eDur1, easing: cubicOut })
				.then(() =>
					Promise.all([
						scale.set(0, { duration: eDur2, easing: cubicIn }),
						alpha.set(0, { duration: eDur2, easing: cubicIn }),
					]),
				)
				.then(() => {
					props.oncomplete?.();
				});
		} else if (s === 'land') {
			const lDur1 = isTurbo ? 30 : 60;
			const lDur2 = isTurbo ? 45 : 90;
			scale
				.set(0.88, { duration: lDur1, easing: cubicOut })
				.then(() => scale.set(1.0, { duration: lDur2, easing: backOut }))
				.then(() => {
					props.oncomplete?.();
				});
		} else if (s === 'spin') {
			scale.set(0.95, { duration: isTurbo ? 25 : 50 });
			alpha.set(0.85, { duration: isTurbo ? 25 : 50 });
		} else {
			scale.set(1.0, { duration: isTurbo ? 25 : 60 });
			alpha.set(1.0, { duration: isTurbo ? 25 : 60 });
		}
	});

	const TILE_SIZE = 94;
</script>

<Container
	x={props.x}
	y={props.y}
	scale={{ x: scale.current, y: scale.current }}
	alpha={alpha.current}
>
	{#if isMultiplier}
		<BaseSprite
			texture={getMultiplierAuraTexture()}
			anchor={0.5}
			width={104}
			height={104}
			tint={multiplierTint}
		/>
	{/if}
	<BaseSprite
		texture={symbolTexture}
		anchor={0.5}
		width={TILE_SIZE}
		height={TILE_SIZE}
	/>
	{#if isWinning}
		<BaseSprite
			texture={symbolTexture}
			anchor={0.5}
			width={TILE_SIZE}
			height={TILE_SIZE}
			tint={0xffe288}
			alpha={0.2}
			blendMode="add"
		/>
	{/if}
	{#if isMultiplier}
		<BaseSprite texture={getMultiplierLabelTexture(multiplier)} anchor={0.5} width={72} height={31.5} />
	{/if}
</Container>
