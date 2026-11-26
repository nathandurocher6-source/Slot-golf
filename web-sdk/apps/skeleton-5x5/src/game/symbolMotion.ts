import type { SymbolName } from './types';

const rank = { tilt: 0, rebound: 0.044, squash: 0.036, stretch: 0.021 };
const club = { tilt: 0.068, rebound: 0.088, squash: 0.058, stretch: 0.028 };
const heavy = { tilt: 0.038, rebound: 0.075, squash: 0.087, stretch: 0.027 };

export const SYMBOL_MOTION = {
	L1: rank,
	L2: rank,
	L3: rank,
	L4: rank,
	L5: rank,
	H1: club,
	H2: heavy,
	H3: club,
	H4: { tilt: 0.057, rebound: 0.1, squash: 0.054, stretch: 0.031 },
	S: { tilt: 0.051, rebound: 0.071, squash: 0.051, stretch: 0.023 },
	W: heavy,
	M: { tilt: 0.018, rebound: 0.146, squash: 0.072, stretch: 0.045 },
} satisfies Record<SymbolName, typeof rank>;
