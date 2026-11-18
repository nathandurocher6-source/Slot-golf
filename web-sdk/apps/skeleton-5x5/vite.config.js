import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
// @ts-ignore
import config from 'config-vite';

export default mergeConfig(config(), {
	resolve: {
		alias: {
			webfontloader: fileURLToPath(new URL('./src/game/systemFontLoader.ts', import.meta.url)),
		},
	},
});
