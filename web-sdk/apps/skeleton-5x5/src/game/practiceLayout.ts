import { GOLF_FRAME_PANEL } from './golfAssets';

type Screen = { width: number; height: number };

// Fractional image coordinates on the runtime PNGs, measured from their trimmed bounds.
export const PRACTICE_ART = {
	frame: { top: 0.0295, bottom: 0.9474 },
	platform: { aspect: 1983 / 155, floor: 0.51 },
	golfer: { shoes: 0.996, driverFaceX: 0.984, driverFaceY: 0.949 },
	socket: { holeX: 0.5, holeY: 0.463 },
	tee: { shaftX: 0.5, seat: 0.063, exposed: 0.23 },
} as const;

export function getPracticeBackdrop(screen: Screen, texture: Screen) {
	const { width, height } = screen;
	const scale = Math.max(width / texture.width, height / texture.height);
	return {
		scale,
		// Retain the shelter at the left of the crop. Both modes use this projection.
		x: width / 2 + (texture.width * scale - width) * 0.28,
		y: height / 2,
	};
}

function safeAreas() {
	if (typeof document === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 };
	const root = getComputedStyle(document.documentElement);
	const read = (side: string) => parseFloat(root.getPropertyValue(`--practice-safe-${side}`)) || 0;
	return { top: read('top'), right: read('right'), bottom: read('bottom'), left: read('left') };
}

function composePractice({ width, height }: Screen) {
	const safe = safeAreas();
	const portrait = width / height < 1.18;
	const compact = !portrait && height <= 560;
	const sidePadding = portrait ? 8 : Math.max(12, width * (compact ? 0.027 : 0.021));
	const platformWidth = Math.max(
		1,
		width - 2 * Math.max(sidePadding, safe.left + 5, safe.right + 5),
	);
	const platformHeight = platformWidth / PRACTICE_ART.platform.aspect;
	const hudTop =
		height - safe.bottom - (portrait ? 132 : compact ? 72 : Math.max(99, height * 0.106));
	const floor = Math.min(
		height * (portrait ? 0.86 : 0.834),
		hudTop - platformHeight * (1 - PRACTICE_ART.platform.floor) - (compact ? 6 : 15),
	);
	const frameRatio = GOLF_FRAME_PANEL.height / GOLF_FRAME_PANEL.width;
	const frameVisibleRatio = PRACTICE_ART.frame.bottom - PRACTICE_ART.frame.top;
	// Match the logo's native aspect, the badge gap and the purchase button.
	const brandBottom =
		Math.max(12, safe.top) +
		Math.min(210, Math.max(120, width * 0.13)) * (708 / 1224) +
		Math.min(10, Math.max(8, width * 0.008)) +
		Math.min(48, Math.max(44, width * 0.033));
	const header = portrait
		? width <= 620
			? safe.top + (width < 360 ? 105 : 113)
			: brandBottom + 14
		: safe.top + (compact ? 12 : height * 0.026);
	const decorBudget = portrait ? Math.min(width * 0.31, Math.max(54, (floor - header) * 0.25)) : 0;
	const frameFoot = floor - (portrait ? decorBudget : platformHeight * 0.09);
	const frameHeight = Math.max(
		1,
		Math.min(
			(frameFoot - header) / frameVisibleRatio,
			(width * (portrait ? 0.91 : compact ? 0.45 : 0.395)) / frameRatio,
		),
	);
	const frameWidth = frameHeight * frameRatio;
	const frameX = width / 2;
	const frameY = frameFoot - frameHeight * (PRACTICE_ART.frame.bottom - GOLF_FRAME_PANEL.center.y);
	const frameLeft = frameX - frameWidth / 2;
	const frameRight = frameX + frameWidth / 2;
	const laneLeft = (width - platformWidth) / 2;
	const laneRight = width - laneLeft;
	// Match the compact logo width, the badge gap and Buy Bonus's 34px button.
	const compactBrandHeight =
		Math.max(6, safe.top) + Math.min(112, Math.max(63, width * 0.125)) * (708 / 1224) + 44;
	const leftLimit = portrait ? width * 0.47 : frameLeft - width * 0.009;
	const rightLimit = portrait ? width * 0.61 : frameRight + width * 0.02;

	return {
		portrait,
		compact,
		floor,
		hudTop,
		platformWidth,
		platformHeight,
		frameWidth,
		frameHeight,
		frameX,
		frameY,
		frameFoot,
		golfer: {
			left: laneLeft + platformWidth * (portrait ? 0.08 : compact ? 0.018 : 0.0045),
			right: leftLimit,
			maxHeight: portrait
				? Math.max(0, decorBudget - 5)
				: Math.max(
						0,
						Math.min(height * 0.652, floor - (compact ? compactBrandHeight : brandBottom + 14)),
					),
		},
		dispenser: {
			left: rightLimit,
			right: laneRight - platformWidth * (portrait ? 0.09 : 0.036),
			maxHeight: portrait ? Math.max(0, decorBudget * 0.87) : height * 0.433,
		},
	};
}

let cached:
	| { width: number; height: number; layout: ReturnType<typeof composePractice> }
	| undefined;
export function getPracticeLayout(screen: Screen) {
	if (!cached || cached.width !== screen.width || cached.height !== screen.height) {
		cached = { ...screen, layout: composePractice(screen) };
	}
	return cached.layout;
}
