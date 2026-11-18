<script lang="ts">
	import { onMount } from 'svelte';
	import { Container, Rectangle, Text } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { CanvasSizeRectangle, MainContainer } from 'components-layout';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	import { getContext } from '../game/context';
	import TransitionAnimation from './TransitionAnimation.svelte';
	import PressToContinue from './PressToContinue.svelte';

	import { pregenerateSymbolTextures } from '../game/symbolTextureCache';

	type Props = {
		onloaded: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	let loadingType = $state<'start' | 'transition'>('start');
	let isReady = $state(false);
	const progress = new Tween(0);

	onMount(async () => {
		pregenerateSymbolTextures();
		await progress.set(100, { duration: 450, easing: cubicOut });
		isReady = true;
	});

	const BAR_WIDTH = 280;
	const BAR_HEIGHT = 10;
</script>

<!-- Logo & Loading Progress -->
<FadeContainer show={loadingType === 'start'}>
	<CanvasSizeRectangle backgroundColor={0x05130c} zIndex={100} />

	<MainContainer>
		<Container
			x={context.stateLayoutDerived.mainLayout().width * 0.5}
			y={context.stateLayoutDerived.mainLayout().height * 0.48}
			zIndex={101}
		>
			<!-- Studio Logo / Title Badge -->
			<Rectangle
				y={-50}
				width={190}
				height={28}
				borderRadius={8}
				backgroundColor={0x0f2b1c}
				borderColor={0x22c55e}
				borderWidth={1.5}
				anchor={0.5}
			/>

			<Text
				y={-50}
				text="STAKE ENGINE"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 12,
					fontWeight: '900',
					fill: 0x86efac,
					letterSpacing: 2.5,
				}}
			/>

			<!-- Game Main Title -->
			<Text
				y={-6}
				text="FAIRWAY CHAMPIONS"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 30,
					fontWeight: '900',
					fill: 0xfacc15,
					letterSpacing: 1.5,
				}}
			/>

			<!-- Game Subtitle -->
			<Text
				y={26}
				text="CHAMPIONSHIP GOLF 5X5"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 11,
					fontWeight: '800',
					fill: 0x4ade80,
					letterSpacing: 3,
				}}
			/>

			<!-- Progress Bar Background -->
			<Rectangle
				y={72}
				width={BAR_WIDTH}
				height={BAR_HEIGHT}
				borderRadius={5}
				backgroundColor={0x0d2417}
				borderColor={0x1e4e33}
				borderWidth={1.5}
				anchor={0.5}
			/>

			<!-- Progress Bar Fill -->
			{#if progress.current > 0}
				<Rectangle
					x={-BAR_WIDTH * 0.5 + (BAR_WIDTH * (progress.current / 100)) * 0.5}
					y={72}
					width={BAR_WIDTH * (progress.current / 100)}
					height={BAR_HEIGHT - 2}
					borderRadius={4}
					backgroundColor={0x22c55e}
					anchor={0.5}
				/>
			{/if}

			<!-- Percentage Text -->
			<Text
				y={95}
				text={isReady ? 'TEE OFF READY' : `${Math.round(progress.current)}%`}
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 11,
					fontWeight: '800',
					fill: isReady ? 0xfacc15 : 0x86efac,
					letterSpacing: 1.5,
				}}
			/>
		</Container>
	</MainContainer>
</FadeContainer>

<!-- Press to Continue Prompt -->
<FadeContainer show={loadingType === 'start' && isReady}>
	<PressToContinue onpress={() => (loadingType = 'transition')} />
</FadeContainer>

<!-- Transition between Loading Screen and Game -->
<FadeContainer show={loadingType === 'transition'}>
	<TransitionAnimation oncomplete={props.onloaded} />
</FadeContainer>
