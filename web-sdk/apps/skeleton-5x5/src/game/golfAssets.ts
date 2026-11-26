import type { SymbolName } from './types';

export const GOLF_SYMBOL_ART = {
	H1: 'h1-driver',
	H2: 'h2-cart',
	H3: 'h3-irons',
	H4: 'h4-tees',
	L1: 'l1-a',
	L2: 'l2-k',
	L3: 'l3-q',
	L4: 'l4-j',
	L5: 'l5-10',
	W: 'wild',
	S: 'scatter',
	M: 'multiplier',
} as const satisfies Record<SymbolName, string>;

const practiceFiles: Record<string, string> = {
	background: 'background_day',
	'background-bonus': 'background_freespins',
	'practice-platform': 'practice_platform',
	'practice-platform-portrait': 'platform_portrait',
	'practice-contact-shadow': 'depth_contact_shadow',
	'practice-platform-shadow': 'platform_cast_shadow',
	'practice-platform-light': 'platform_light',
	'practice-reel-recess': 'reel_recess',
	'practice-ambient-birds': 'ambient_birds',
	'ball-dispenser': 'ball_dispenser',
	'golfer-address': 'golfer_address',
	'tee-socket': 'tee_socket',
	'retractable-tee': 'retractable_tee',
	'golf-ball': 'golf_ball',
};

const folders: Record<string, string> = {
	'board-frame': 'course',
	mascot: 'characters',
	'decor-cart': 'characters',
	...Object.fromEntries(Object.values(GOLF_SYMBOL_ART).map((name) => [name, 'symbols'])),
};

// Relative to the game or Storybook entry point so a hosted subdirectory works too.
export const golfAssetUrl = (name: string) =>
	practiceFiles[name]
		? `./assets/birdie-breakout/practice/${practiceFiles[name]}.png`
		: `./assets/birdie-breakout/${folders[name] ?? 'ui'}/${name}.png`;

export const getSymbolImageUrl = (name: SymbolName) => golfAssetUrl(GOLF_SYMBOL_ART[name]);

// The prepared frame contains five printed columns. Ratios are measured inside its gold rails.
export const GOLF_FRAME_PANEL = {
	width: 0.866,
	height: 0.725,
	center: { x: 0.5, y: 0.54 },
};
