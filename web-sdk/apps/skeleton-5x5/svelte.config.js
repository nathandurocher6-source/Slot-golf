// @ts-ignore
import config from 'config-svelte';
import { rm } from 'node:fs/promises';

const appConfig = config();
const staticAdapter = appConfig.kit.adapter;
const obsoleteExportAssets = [
	'favicon.svg',
	'loader.gif',
	'stake-engine-loader.gif',
	'assets/fonts',
	'assets/spines',
	'assets/sprites',
	'assets/birdie-breakout/characters',
	'assets/birdie-breakout/course/background.png',
	'assets/birdie-breakout/course/background-bonus.png',
	'assets/birdie-breakout/practice/contact_shadow.png',
	'assets/birdie-breakout/ui/bottom-bar.png',
	'assets/birdie-breakout/ui/spin-ball.png',
];

export default {
	...appConfig,
	kit: {
		...appConfig.kit,
		paths: { ...appConfig.kit.paths, relative: true },
		adapter: {
			...staticAdapter,
			async adapt(builder) {
				await staticAdapter.adapt(builder);
				// Source art and Storybook resources remain available in static.
				await Promise.all(
					obsoleteExportAssets.map((asset) =>
						rm(new URL(`./build/${asset}`, import.meta.url), { recursive: true, force: true }),
					),
				);
			},
		},
	},
};
