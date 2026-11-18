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

// Relative to the game or Storybook entry point so a hosted subdirectory works too.
export const golfAssetUrl = (name: string) => `./assets/golf/${name}.png`;

export const getSymbolImageUrl = (name: SymbolName) => golfAssetUrl(GOLF_SYMBOL_ART[name]);
