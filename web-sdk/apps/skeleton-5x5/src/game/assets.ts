import type { Asset, Assets } from 'pixi-svelte';
import { GOLF_SYMBOL_ART, golfAssetUrl } from './golfAssets';

const golfTextures = [
	'background',
	'background-bonus',
	'board-frame',
	'logo',
	'practice-platform',
	'practice-contact-shadow',
	'practice-platform-shadow',
	'practice-platform-light',
	'practice-reel-recess',
	'golfer-address',
	'ball-dispenser',
	'tee-socket',
	'retractable-tee',
	'golf-ball',
	'win',
	'big-win',
	'mega-win',
	...Object.values(GOLF_SYMBOL_ART),
];

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
