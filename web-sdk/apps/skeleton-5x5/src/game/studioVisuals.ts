import { PIXI, type LoadedAssets, type LoadedSprite } from 'pixi-svelte';
import { bookEventAmountToBetAmountMultiplier } from 'utils-shared/amount';
import { GOLF_FRAME_PANEL } from './golfAssets';

export const studioTexture = (assets: LoadedAssets, name: string) =>
	(assets[name] as LoadedSprite | undefined) ?? PIXI.Texture.EMPTY;

export const isCelebrationWin = (amount: number) =>
	bookEventAmountToBetAmountMultiplier(amount) > 1;

export const getWinPresentation = (amount: number, isMax: boolean) => {
	const multiple = bookEventAmountToBetAmountMultiplier(amount);
	if (isMax || multiple >= 100000) {
		return { banner: 'mega-win', duration: 2350, hold: 960 };
	}
	if (multiple >= 50) {
		return { banner: 'mega-win', duration: 1700, hold: 700 };
	}
	if (multiple >= 15) {
		return { banner: 'big-win', duration: 1240, hold: 560 };
	}
	if (multiple >= 5) {
		return { banner: 'win', duration: 920, hold: 490 };
	}
	return { banner: 'win', duration: 660, hold: 360 };
};

type Layout = { x: number; y: number; width: number; height: number; scale: number };

export const getFrameOnScreen = (main: Layout, board: Layout) => {
	const centerX = main.x + (board.x - main.width / 2) * main.scale;
	const centerY = main.y + (board.y - main.height / 2) * main.scale;
	const width = (board.width / GOLF_FRAME_PANEL.width) * board.scale * main.scale;
	const height = (board.height / GOLF_FRAME_PANEL.height) * board.scale * main.scale;
	return {
		centerX,
		centerY,
		left: centerX - width * GOLF_FRAME_PANEL.center.x,
		right: centerX + width * (1 - GOLF_FRAME_PANEL.center.x),
		top: centerY - height * GOLF_FRAME_PANEL.center.y,
		bottom: centerY + height * (1 - GOLF_FRAME_PANEL.center.y),
	};
};

export function getFairwayLayout(
	screen: { width: number; height: number },
	board: ReturnType<typeof getFrameOnScreen>,
) {
	const portrait = screen.height > screen.width && screen.width <= 600;
	const floor = Math.min(screen.height * 0.84, screen.height - (screen.height <= 550 ? 84 : 126));
	const left = board.left;
	const right = screen.width - board.right;
	const roomBelowBadge = floor - Math.min(180, Math.max(119, screen.height * 0.21)) - 64;
	return {
		floor,
		cartX: portrait ? screen.width * 0.78 : board.right + right / 2,
		cartFloor: portrait ? screen.height - 158 : floor,
		cartWidth: portrait
			? Math.min(140, screen.width * 0.34, (screen.height - 168 - board.bottom) * 1.03)
			: Math.min(368, right * 0.86, floor * 0.63),
		golferX: left / 2,
		golferHeight:
			screen.width >= 960 && screen.height >= 560
				? Math.max(0, Math.min(458, floor * 0.8, left * 1.46, roomBelowBadge))
				: 0,
	};
}

export const STUDIO_FONT = 'Birdie Breakout Display';

export function warmStudioFont() {
	if (PIXI.Cache.has(`${STUDIO_FONT}-bitmap`)) return;
	PIXI.BitmapFont.install({
		name: STUDIO_FONT,
		resolution: 1.5,
		skipKerning: true,
		chars: [[' ', '~'], 'ÀÂÇÉÈÊÎÔÙÛ€£¥₹₩₽×·  '],
		style: {
			fontFamily: 'Arial Black, system-ui, sans-serif',
			fontSize: 44,
			fontWeight: '900',
			fill: 0xffffff,
			stroke: { color: 0x23160d, width: 4, join: 'round' },
		},
	});
}
