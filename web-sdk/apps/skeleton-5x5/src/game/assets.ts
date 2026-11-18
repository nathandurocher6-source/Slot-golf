import type { Asset, Assets } from 'pixi-svelte';
import { GOLF_SYMBOL_ART, golfAssetUrl } from './golfAssets';

const golfTextures = ['background', 'board-frame', ...Object.values(GOLF_SYMBOL_ART)];

export default {
	...Object.fromEntries(
		golfTextures.map((name) => [
			name,
			{ type: 'sprite', src: golfAssetUrl(name), preload: true } satisfies Asset,
		]),
	),
	sound: {
		type: 'audio',
		src: './assets/audio/sounds.json',
		preload: true,
	},
} satisfies Assets;
