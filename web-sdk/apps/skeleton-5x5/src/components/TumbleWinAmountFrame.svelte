<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Container, Rectangle, Text, type Sizes } from 'pixi-svelte';

	type Props = {
		isEquation?: boolean;
		isPulse?: boolean;
		children: Snippet<[{ frameSizes: Sizes }]>;
	};

	const props: Props = $props();
	const PANEL_SIZES = $derived({
		width: props.isEquation ? 340 : 220,
		height: 52,
	});
</script>

<Container>
	<!-- Outer Glow Aura when Multiplier Applied -->
	{#if props.isPulse || props.isEquation}
		<Rectangle
			width={PANEL_SIZES.width + 12}
			height={PANEL_SIZES.height + 12}
			borderRadius={16}
			backgroundColor={0xfacc15}
			backgroundAlpha={0.35}
			borderColor={0xfacc15}
			borderWidth={2}
			anchor={0.5}
		/>
	{/if}

	<!-- Outer Frame (Golf Green Obsidian & Gold) -->
	<Rectangle
		width={PANEL_SIZES.width}
		height={PANEL_SIZES.height}
		borderRadius={12}
		backgroundColor={0x081911}
		backgroundAlpha={0.96}
		borderColor={props.isEquation ? 0xfacc15 : 0x1f4733}
		borderWidth={props.isEquation ? 2.5 : 1.5}
		anchor={0.5}
	/>

	<!-- Header Badge -->
	<Rectangle
		y={-PANEL_SIZES.height * 0.5}
		width={props.isEquation ? 150 : 115}
		height={18}
		borderRadius={6}
		backgroundColor={props.isEquation ? 0x241d04 : 0x0f2d1e}
		borderColor={props.isEquation ? 0xfacc15 : 0x22c55e}
		borderWidth={1}
		anchor={0.5}
	/>

	<Text
		y={-PANEL_SIZES.height * 0.5}
		text={props.isEquation ? 'GAIN MULTIPLIÉ' : 'GAIN DU TOUR'}
		anchor={0.5}
		style={{
			fontFamily: 'system-ui, -apple-system, sans-serif',
			fontSize: 9,
			fontWeight: '800',
			fill: props.isEquation ? 0xfacc15 : 0x86efac,
			letterSpacing: 1,
		}}
	/>

	{@render props.children({ frameSizes: PANEL_SIZES })}
</Container>
