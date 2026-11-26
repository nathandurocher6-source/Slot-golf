<script lang="ts">
	import { BaseSprite, Container, PIXI } from 'pixi-svelte';
	import StudioText from './StudioText.svelte';

	type Props = {
		width: number;
		title: string;
		value: string;
		detail?: string;
		prompt?: string;
		tint?: number;
	};
	const { width, title, value, detail, prompt, tint = 0xffd465 }: Props = $props();
	const height = $derived(width * 0.43);
</script>

<BaseSprite
	texture={PIXI.Texture.WHITE}
	tint={0x172f24}
	alpha={0.97}
	anchor={0.5}
	{width}
	{height}
/>
<Container y={height * 0.015}>
	<StudioText text={title} y={-height * 0.25} size={width * 0.08} maxWidth={width * 0.8} {tint} />
	<StudioText text={value} y={-height * 0.035} size={width * 0.108} maxWidth={width * 0.8} />
	{#if detail}
		<StudioText
			text={detail}
			y={height * 0.18}
			size={width * 0.037}
			maxWidth={width * 0.8}
			tint={0xc2eca0}
		/>
	{/if}
</Container>
{#if prompt}
	<StudioText
		text={prompt}
		y={height * 0.58}
		size={Math.min(14, width * 0.038)}
		maxWidth={width * 0.86}
		tint={0xffefd0}
	/>
{/if}
