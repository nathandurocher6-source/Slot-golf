// @ts-ignore
import config from 'config-svelte';

const appConfig = config();

export default {
	...appConfig,
	kit: {
		...appConfig.kit,
		paths: { ...appConfig.kit.paths, relative: true },
	},
};
