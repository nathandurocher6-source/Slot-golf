<script lang="ts">
	import { BitmapText } from 'pixi-svelte';
	import { STUDIO_FONT, warmStudioFont } from '../game/studioVisuals';

	type Props = {
		text: string;
		x?: number;
		y?: number;
		size: number;
		tint?: number;
		maxWidth?: number;
	};

	const { text, x, y, size, tint = 0xfff7d9, maxWidth }: Props = $props();
	const fontSize = $derived(
		maxWidth ? Math.min(size, maxWidth / Math.max(text.length * 0.65, 1)) : size,
	);
	warmStudioFont();
</script>

<BitmapText {x} {y} {text} {tint} anchor={0.5} style={{ fontFamily: STUDIO_FONT, fontSize }} />
