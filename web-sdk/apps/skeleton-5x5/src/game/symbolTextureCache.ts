import { PIXI } from 'pixi-svelte';
import type { RawSymbol } from './types';

export type SymbolStyleConfig = {
	bg: number;
	border: number;
	borderWidth: number;
	textColor: number;
	mainText: string;
	subText?: string;
	fontSize: number;
	isHigh: boolean;
	isSpecial: boolean;
	isMultiplier: boolean;
	accentColor: string;
};

export const getSymbolStyle = (rawSymbol: RawSymbol): SymbolStyleConfig => {
	const name = rawSymbol.name;
	const mult = rawSymbol.multiplier;

	switch (name) {
		// Low Pays: Styled 10, J, Q, K, A with golf ball dimple & green grass textures
		case 'L5':
			return {
				bg: 0x0c1e15,
				border: 0x22c55e,
				borderWidth: 2.2,
				textColor: 0x86efac,
				mainText: '10',
				subText: 'TEN',
				fontSize: 26,
				isHigh: false,
				isSpecial: false,
				isMultiplier: false,
				accentColor: '#22c55e',
			};
		case 'L4':
			return {
				bg: 0x0b241b,
				border: 0x10b981,
				borderWidth: 2.2,
				textColor: 0x6ee7b7,
				mainText: 'J',
				subText: 'JACK',
				fontSize: 28,
				isHigh: false,
				isSpecial: false,
				isMultiplier: false,
				accentColor: '#10b981',
			};
		case 'L3':
			return {
				bg: 0x082522,
				border: 0x14b8a6,
				borderWidth: 2.2,
				textColor: 0x5eead4,
				mainText: 'Q',
				subText: 'QUEEN',
				fontSize: 28,
				isHigh: false,
				isSpecial: false,
				isMultiplier: false,
				accentColor: '#14b8a6',
			};
		case 'L2':
			return {
				bg: 0x09232c,
				border: 0x0ea5e9,
				borderWidth: 2.2,
				textColor: 0x7dd3fc,
				mainText: 'K',
				subText: 'KING',
				fontSize: 28,
				isHigh: false,
				isSpecial: false,
				isMultiplier: false,
				accentColor: '#0ea5e9',
			};
		case 'L1':
			return {
				bg: 0x1a2412,
				border: 0xeab308,
				borderWidth: 2.5,
				textColor: 0xfef08a,
				mainText: 'A',
				subText: 'ACE',
				fontSize: 29,
				isHigh: false,
				isSpecial: false,
				isMultiplier: false,
				accentColor: '#eab308',
			};

		// High Pays: Golf Championship Equipment & Vehicles
		case 'H4':
			return {
				bg: 0x1e0e24,
				border: 0xf43f5e,
				borderWidth: 2.8,
				textColor: 0xfda4af,
				mainText: 'H4',
				subText: 'TEES',
				fontSize: 28,
				isHigh: true,
				isSpecial: false,
				isMultiplier: false,
				accentColor: '#f43f5e',
			};
		case 'H3':
			return {
				bg: 0x0f172a,
				border: 0x94a3b8,
				borderWidth: 2.8,
				textColor: 0xf1f5f9,
				mainText: 'H3',
				subText: 'IRONS',
				fontSize: 28,
				isHigh: true,
				isSpecial: false,
				isMultiplier: false,
				accentColor: '#38bdf8',
			};
		case 'H2':
			return {
				bg: 0x07261a,
				border: 0x10b981,
				borderWidth: 3,
				textColor: 0xa7f3d0,
				mainText: 'H2',
				subText: 'CART',
				fontSize: 28,
				isHigh: true,
				isSpecial: false,
				isMultiplier: false,
				accentColor: '#10b981',
			};
		case 'H1':
			return {
				bg: 0x081c38,
				border: 0x00f0ff,
				borderWidth: 3.2,
				textColor: 0x67e8f9,
				mainText: 'H1',
				subText: 'DRIVER',
				fontSize: 28,
				isHigh: true,
				isSpecial: false,
				isMultiplier: false,
				accentColor: '#00f0ff',
			};

		// Specials: Wild Trophy, Scatter Hole 18, Multiplier Golden Ball
		case 'W':
			return {
				bg: 0x271904,
				border: 0xffd700,
				borderWidth: 3.5,
				textColor: 0xfff066,
				mainText: 'W',
				subText: 'WILD',
				fontSize: 32,
				isHigh: true,
				isSpecial: true,
				isMultiplier: false,
				accentColor: '#ffd700',
			};
		case 'S':
			return {
				bg: 0x2b0614,
				border: 0xff2255,
				borderWidth: 3.5,
				textColor: 0xff7799,
				mainText: 'S',
				subText: 'SCATTER',
				fontSize: 30,
				isHigh: true,
				isSpecial: true,
				isMultiplier: false,
				accentColor: '#ff2255',
			};
		case 'M': {
			const mVal = mult ?? 2;
			const isHighMult = mVal >= 50;
			const isMidMult = mVal >= 10;
			const multBorder = isHighMult ? 0xff2a6d : isMidMult ? 0xf59e0b : 0x00ff88;
			const multAccent = isHighMult ? '#ff2a6d' : isMidMult ? '#f59e0b' : '#00ff88';
			return {
				bg: isHighMult ? 0x2a0815 : isMidMult ? 0x241804 : 0x052a16,
				border: multBorder,
				borderWidth: 3.5,
				textColor: 0xffffff,
				mainText: mult ? `x${mult}` : 'MULT',
				subText: 'BOMB',
				fontSize: mult && mult >= 100 ? 22 : 26,
				isHigh: true,
				isSpecial: true,
				isMultiplier: true,
				accentColor: multAccent,
			};
		}

		default:
			return {
				bg: 0x0d171e,
				border: 0x334155,
				borderWidth: 2,
				textColor: 0xffffff,
				mainText: String(name),
				fontSize: 26,
				isHigh: false,
				isSpecial: false,
				isMultiplier: false,
				accentColor: '#64748b',
			};
	}
};

const drawRoundRect = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
) => {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + w - r, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + r);
	ctx.lineTo(x + w, y + h - r);
	ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	ctx.lineTo(x + r, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - r);
	ctx.lineTo(x, y + r);
	ctx.quadraticCurveTo(x, y, x + r, y);
	ctx.closePath();
};

/**
 * Draws cartoon golf ball dimples inside a path
 */
const drawDimplePattern = (
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	radius: number,
	dotColor: string,
) => {
	ctx.save();
	ctx.beginPath();
	ctx.arc(cx, cy, radius, 0, Math.PI * 2);
	ctx.clip();

	const spacing = 12;
	ctx.fillStyle = dotColor;

	for (let y = cy - radius + 4; y <= cy + radius - 4; y += spacing) {
		const rowOffset = Math.floor((y - cy) / spacing) % 2 === 0 ? 0 : spacing * 0.5;
		for (let x = cx - radius + 4; x <= cx + radius - 4; x += spacing) {
			const dx = x + rowOffset - cx;
			const dy = y - cy;
			if (dx * dx + dy * dy < (radius - 5) * (radius - 5)) {
				ctx.beginPath();
				ctx.arc(x + rowOffset, y, 2.2, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}
	ctx.restore();
};

/**
 * Draws a sharp cartoon Golf Ball with 3D gradient, dimples, specular glint and black outline
 */
const drawGolfBall = (
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	radius: number,
	gold = false,
) => {
	ctx.save();

	// Outer black contour
	ctx.beginPath();
	ctx.arc(cx, cy, radius, 0, Math.PI * 2);
	ctx.fillStyle = '#050a0e';
	ctx.fill();

	// Ball Sphere
	const innerR = radius - 3.5;
	const grad = ctx.createRadialGradient(
		cx - innerR * 0.35,
		cy - innerR * 0.35,
		innerR * 0.1,
		cx,
		cy,
		innerR,
	);

	if (gold) {
		grad.addColorStop(0, '#fffbe6');
		grad.addColorStop(0.35, '#fde047');
		grad.addColorStop(0.7, '#eab308');
		grad.addColorStop(1, '#92400e');
	} else {
		grad.addColorStop(0, '#ffffff');
		grad.addColorStop(0.4, '#f8fafc');
		grad.addColorStop(0.8, '#cbd5e1');
		grad.addColorStop(1, '#64748b');
	}

	ctx.beginPath();
	ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
	ctx.fillStyle = grad;
	ctx.fill();

	// Dimples
	drawDimplePattern(ctx, cx, cy, innerR - 2, gold ? 'rgba(146, 64, 14, 0.35)' : 'rgba(100, 116, 139, 0.35)');

	// Curved specular highlight
	ctx.beginPath();
	ctx.ellipse(cx - innerR * 0.35, cy - innerR * 0.35, innerR * 0.45, innerR * 0.25, -Math.PI / 4, 0, Math.PI * 2);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
	ctx.fill();

	ctx.restore();
};

/**
 * Render H4: Duo de Tees de golf (rose vif et bleu turquoise) dans une touffe d'herbe
 */
const drawSymbolH4 = (ctx: CanvasRenderingContext2D, size: number) => {
	const cx = size / 2;
	const cy = size / 2 + 6;

	// Grass tuft at base
	const grassY = cy + 28;
	ctx.save();
	ctx.fillStyle = '#15803d';
	ctx.strokeStyle = '#050d08';
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(cx - 52, grassY + 8);
	ctx.quadraticCurveTo(cx - 36, grassY - 14, cx - 28, grassY + 2);
	ctx.quadraticCurveTo(cx - 18, grassY - 20, cx - 6, grassY + 4);
	ctx.quadraticCurveTo(cx + 8, grassY - 22, cx + 18, grassY + 2);
	ctx.quadraticCurveTo(cx + 34, grassY - 16, cx + 52, grassY + 8);
	ctx.quadraticCurveTo(cx, grassY + 22, cx - 52, grassY + 8);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

	// Grass highlight blades
	ctx.fillStyle = '#4ade80';
	ctx.beginPath();
	ctx.moveTo(cx - 26, grassY + 2);
	ctx.quadraticCurveTo(cx - 18, grassY - 16, cx - 14, grassY);
	ctx.quadraticCurveTo(cx, grassY - 18, cx + 6, grassY);
	ctx.quadraticCurveTo(cx + 18, grassY - 14, cx + 24, grassY + 4);
	ctx.closePath();
	ctx.fill();
	ctx.restore();

	// Helper to draw a golf tee
	const drawTee = (
		tx: number,
		ty: number,
		rot: number,
		mainColor: string,
		shadeColor: string,
		lightColor: string,
	) => {
		ctx.save();
		ctx.translate(tx, ty);
		ctx.rotate(rot);

		// Outer thick black outline
		ctx.beginPath();
		ctx.moveTo(-16, -34);
		ctx.quadraticCurveTo(0, -31, 16, -34);
		ctx.lineTo(13, -26);
		ctx.quadraticCurveTo(7, -18, 5, -8);
		ctx.lineTo(3.5, 26);
		ctx.quadraticCurveTo(0, 34, -3.5, 26);
		ctx.lineTo(-5, -8);
		ctx.quadraticCurveTo(-7, -18, -13, -26);
		ctx.closePath();
		ctx.fillStyle = '#050505';
		ctx.lineWidth = 5;
		ctx.stroke();

		// Fill Gradient
		const teeGrad = ctx.createLinearGradient(-14, 0, 14, 0);
		teeGrad.addColorStop(0, shadeColor);
		teeGrad.addColorStop(0.4, lightColor);
		teeGrad.addColorStop(1, mainColor);
		ctx.fillStyle = teeGrad;
		ctx.fill();

		// Top cup rim
		ctx.beginPath();
		ctx.ellipse(0, -32, 13, 4.5, 0, 0, Math.PI * 2);
		ctx.fillStyle = lightColor;
		ctx.fill();
		ctx.strokeStyle = '#050505';
		ctx.lineWidth = 2.5;
		ctx.stroke();

		// Specular glint
		ctx.beginPath();
		ctx.moveTo(-3, -22);
		ctx.lineTo(-2, 16);
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
		ctx.lineWidth = 2.5;
		ctx.stroke();

		ctx.restore();
	};

	// Left Tee (Vivid Hot Pink)
	drawTee(cx - 20, cy - 2, -0.22, '#be185d', '#831843', '#f472b6');

	// Right Tee (Vibrant Cyan / Turquoise)
	drawTee(cx + 20, cy - 2, 0.22, '#0284c7', '#075985', '#38bdf8');
};

/**
 * Render H3: Paire de Fers de golf chromés croisés (Crossed Irons)
 */
const drawSymbolH3 = (ctx: CanvasRenderingContext2D, size: number) => {
	const cx = size / 2;
	const cy = size / 2 - 2;

	const drawIronClub = (rot: number) => {
		ctx.save();
		ctx.translate(cx, cy);
		ctx.rotate(rot);

		// Steel Shaft (with thick black outline)
		ctx.strokeStyle = '#050910';
		ctx.lineWidth = 11;
		ctx.beginPath();
		ctx.moveTo(0, -56);
		ctx.lineTo(0, 52);
		ctx.stroke();

		// Shaft chrome gradient
		const shaftGrad = ctx.createLinearGradient(-4, 0, 4, 0);
		shaftGrad.addColorStop(0, '#64748b');
		shaftGrad.addColorStop(0.45, '#ffffff');
		shaftGrad.addColorStop(1, '#94a3b8');
		ctx.strokeStyle = shaftGrad;
		ctx.lineWidth = 6;
		ctx.stroke();

		// Rubber Grip (bottom)
		ctx.beginPath();
		ctx.moveTo(0, 16);
		ctx.lineTo(0, 54);
		ctx.strokeStyle = '#090d16';
		ctx.lineWidth = 9.5;
		ctx.stroke();

		// Grip texture rings
		ctx.strokeStyle = '#334155';
		ctx.lineWidth = 1.8;
		for (let gy = 22; gy <= 48; gy += 6) {
			ctx.beginPath();
			ctx.moveTo(-4, gy);
			ctx.lineTo(4, gy);
			ctx.stroke();
		}

		// Iron Head at top
		ctx.save();
		ctx.translate(0, -50);

		// Head outer black outline
		ctx.beginPath();
		ctx.moveTo(-4, 0);
		ctx.lineTo(8, -8);
		ctx.quadraticCurveTo(28, -20, 40, -12);
		ctx.quadraticCurveTo(46, -4, 38, 8);
		ctx.lineTo(8, 12);
		ctx.quadraticCurveTo(-4, 8, -4, 0);
		ctx.closePath();
		ctx.fillStyle = '#050910';
		ctx.lineWidth = 5;
		ctx.stroke();

		// Chrome Head Fill
		const headGrad = ctx.createLinearGradient(0, -16, 36, 12);
		headGrad.addColorStop(0, '#ffffff');
		headGrad.addColorStop(0.35, '#e2e8f0');
		headGrad.addColorStop(0.75, '#94a3b8');
		headGrad.addColorStop(1, '#475569');
		ctx.fillStyle = headGrad;
		ctx.fill();

		// Iron scorelines / grooves
		ctx.strokeStyle = '#1e293b';
		ctx.lineWidth = 1.6;
		for (let s = -6; s <= 6; s += 3.5) {
			ctx.beginPath();
			ctx.moveTo(14 + s * 0.4, s);
			ctx.lineTo(34 + s * 0.2, s - 3);
			ctx.stroke();
		}

		ctx.restore();
		ctx.restore();
	};

	// Crossed Irons in "X"
	drawIronClub(-Math.PI / 4.2);
	drawIronClub(Math.PI / 4.2);

	// Central Champion Sparkle
	ctx.save();
	ctx.translate(cx, cy);
	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
	ctx.fill();

	// 4-point star glint
	ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
	ctx.beginPath();
	ctx.moveTo(-16, 0);
	ctx.quadraticCurveTo(0, 0, 0, -16);
	ctx.quadraticCurveTo(0, 0, 16, 0);
	ctx.quadraticCurveTo(0, 0, 0, 16);
	ctx.quadraticCurveTo(0, 0, -16, 0);
	ctx.fill();
	ctx.restore();
};

/**
 * Render H2: Voiturette de golf (Golf Cart) vue de trois-quarts
 */
const drawSymbolH2 = (ctx: CanvasRenderingContext2D, size: number) => {
	const cx = size / 2;
	const cy = size / 2 + 2;

	ctx.save();
	ctx.translate(cx - 3, cy);

	// 1. Canopy Roof (White curved roof)
	ctx.beginPath();
	ctx.moveTo(-36, -34);
	ctx.quadraticCurveTo(0, -42, 34, -34);
	ctx.quadraticCurveTo(36, -30, 30, -28);
	ctx.quadraticCurveTo(0, -34, -34, -28);
	ctx.closePath();
	ctx.fillStyle = '#ffffff';
	ctx.strokeStyle = '#051009';
	ctx.lineWidth = 4;
	ctx.fill();
	ctx.stroke();

	// 2. Roll Cage Struts
	ctx.strokeStyle = '#051009';
	ctx.lineWidth = 3.5;
	ctx.beginPath();
	// Front strut
	ctx.moveTo(22, -30);
	ctx.lineTo(16, -4);
	// Rear strut
	ctx.moveTo(-28, -29);
	ctx.lineTo(-24, 6);
	ctx.stroke();

	// 3. Windshield with glass reflection
	ctx.beginPath();
	ctx.moveTo(20, -28);
	ctx.lineTo(14, -4);
	ctx.lineTo(2, -4);
	ctx.lineTo(6, -28);
	ctx.closePath();
	ctx.fillStyle = 'rgba(125, 211, 252, 0.55)';
	ctx.strokeStyle = '#051009';
	ctx.lineWidth = 2.5;
	ctx.fill();
	ctx.stroke();

	// Windshield glint
	ctx.beginPath();
	ctx.moveTo(15, -24);
	ctx.lineTo(7, -8);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
	ctx.lineWidth = 2;
	ctx.stroke();

	// 4. Golf Bag strapped to the back
	ctx.save();
	ctx.translate(-30, -6);
	ctx.rotate(-0.25);
	ctx.fillStyle = '#1e3a8a';
	ctx.strokeStyle = '#051009';
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.roundRect(-7, -18, 14, 26, 4);
	ctx.fill();
	ctx.stroke();
	// Club heads sticking out
	ctx.strokeStyle = '#94a3b8';
	ctx.lineWidth = 2.5;
	ctx.beginPath();
	ctx.moveTo(-2, -18);
	ctx.lineTo(-6, -26);
	ctx.moveTo(2, -18);
	ctx.lineTo(4, -27);
	ctx.stroke();
	ctx.restore();

	// 5. Main Cart Body (Emerald Green & White)
	ctx.beginPath();
	ctx.moveTo(-32, 6);
	ctx.lineTo(12, 6);
	ctx.quadraticCurveTo(24, 6, 32, 12);
	ctx.lineTo(38, 20);
	ctx.quadraticCurveTo(34, 24, 26, 24);
	ctx.lineTo(-30, 24);
	ctx.quadraticCurveTo(-34, 20, -32, 6);
	ctx.closePath();

	const bodyGrad = ctx.createLinearGradient(0, 6, 0, 24);
	bodyGrad.addColorStop(0, '#34d399');
	bodyGrad.addColorStop(0.6, '#059669');
	bodyGrad.addColorStop(1, '#064e3b');
	ctx.fillStyle = bodyGrad;
	ctx.strokeStyle = '#051009';
	ctx.lineWidth = 4.5;
	ctx.fill();
	ctx.stroke();

	// White trim stripe
	ctx.beginPath();
	ctx.moveTo(-28, 11);
	ctx.lineTo(24, 11);
	ctx.strokeStyle = '#ffffff';
	ctx.lineWidth = 2.2;
	ctx.stroke();

	// Front Headlight (bright yellow glow)
	ctx.beginPath();
	ctx.arc(36, 17, 4.5, 0, Math.PI * 2);
	ctx.fillStyle = '#fde047';
	ctx.strokeStyle = '#051009';
	ctx.lineWidth = 2;
	ctx.fill();
	ctx.stroke();

	// 6. Tires & Rims (Big cartoon wheels)
	const drawWheel = (wx: number, wy: number) => {
		// Outer tire
		ctx.beginPath();
		ctx.arc(wx, wy, 12, 0, Math.PI * 2);
		ctx.fillStyle = '#111827';
		ctx.strokeStyle = '#051009';
		ctx.lineWidth = 3.5;
		ctx.fill();
		ctx.stroke();

		// Rim
		ctx.beginPath();
		ctx.arc(wx, wy, 6.5, 0, Math.PI * 2);
		ctx.fillStyle = '#cbd5e1';
		ctx.strokeStyle = '#051009';
		ctx.lineWidth = 1.8;
		ctx.fill();
		ctx.stroke();

		// Center hub
		ctx.beginPath();
		ctx.arc(wx, wy, 2.5, 0, Math.PI * 2);
		ctx.fillStyle = '#059669';
		ctx.fill();
	};

	drawWheel(-18, 26);
	drawWheel(22, 26);

	ctx.restore();
};

/**
 * Render H1: Tête de Driver moderne (Titane & Bleu électrique) avec traînée de swing
 */
const drawSymbolH1 = (ctx: CanvasRenderingContext2D, size: number) => {
	const cx = size / 2;
	const cy = size / 2;

	ctx.save();
	ctx.translate(cx, cy);

	// 1. Dynamic Swing Swoosh / Motion Speed Lines
	ctx.strokeStyle = '#00f0ff';
	ctx.lineWidth = 4;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.arc(-2, 4, 52, Math.PI * 0.75, Math.PI * 1.55);
	ctx.stroke();

	ctx.strokeStyle = '#fde047';
	ctx.lineWidth = 2.5;
	ctx.beginPath();
	ctx.arc(-2, 4, 46, Math.PI * 0.85, Math.PI * 1.45);
	ctx.stroke();

	// 2. Club Shaft entering the hosel
	ctx.strokeStyle = '#040d1a';
	ctx.lineWidth = 8;
	ctx.beginPath();
	ctx.moveTo(-42, -42);
	ctx.lineTo(-20, -18);
	ctx.stroke();

	const shaftGrad = ctx.createLinearGradient(-42, -42, -20, -18);
	shaftGrad.addColorStop(0, '#0284c7');
	shaftGrad.addColorStop(0.5, '#38bdf8');
	shaftGrad.addColorStop(1, '#00f0ff');
	ctx.strokeStyle = shaftGrad;
	ctx.lineWidth = 4.5;
	ctx.beginPath();
	ctx.moveTo(-42, -42);
	ctx.lineTo(-20, -18);
	ctx.stroke();

	// 3. Oversized 460cc Driver Head (Profile / 3-quarter view)
	ctx.save();
	ctx.rotate(0.25);

	// Outer black contour
	ctx.beginPath();
	ctx.moveTo(-22, -16);
	ctx.quadraticCurveTo(8, -32, 38, -14); // Crown curve
	ctx.quadraticCurveTo(46, 6, 32, 24); // Face & toe
	ctx.quadraticCurveTo(4, 34, -20, 22); // Sole curve
	ctx.quadraticCurveTo(-34, 4, -22, -16); // Heel / back
	ctx.closePath();
	ctx.fillStyle = '#030712';
	ctx.lineWidth = 5.5;
	ctx.stroke();

	// Carbon Titanium Dark Gradient
	const driverGrad = ctx.createLinearGradient(-20, -25, 30, 25);
	driverGrad.addColorStop(0, '#1e293b');
	driverGrad.addColorStop(0.45, '#0f172a');
	driverGrad.addColorStop(1, '#020617');
	ctx.fillStyle = driverGrad;
	ctx.fill();

	// Electric Blue Aerodynamic Channel / Wing
	ctx.beginPath();
	ctx.moveTo(-14, -8);
	ctx.quadraticCurveTo(4, -20, 26, -10);
	ctx.quadraticCurveTo(10, -2, -14, -8);
	ctx.closePath();
	ctx.fillStyle = '#00f0ff';
	ctx.fill();

	// Titanium Clubface (Right Edge)
	ctx.beginPath();
	ctx.moveTo(34, -12);
	ctx.quadraticCurveTo(44, 4, 30, 22);
	ctx.lineTo(24, 18);
	ctx.quadraticCurveTo(34, 2, 26, -8);
	ctx.closePath();
	ctx.fillStyle = '#94a3b8';
	ctx.strokeStyle = '#030712';
	ctx.lineWidth = 2;
	ctx.fill();
	ctx.stroke();

	// Face scorelines
	ctx.strokeStyle = '#334155';
	ctx.lineWidth = 1.4;
	for (let fy = -4; fy <= 14; fy += 4.5) {
		ctx.beginPath();
		ctx.moveTo(27, fy);
		ctx.lineTo(34, fy + 2);
		ctx.stroke();
	}

	// Curved Specular Glint on Crown
	ctx.beginPath();
	ctx.moveTo(-10, -18);
	ctx.quadraticCurveTo(6, -26, 22, -15);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
	ctx.lineWidth = 2.5;
	ctx.stroke();

	ctx.restore();
	ctx.restore();
};

/**
 * Render W: Trophée Coupe de Championnat en or massif
 */
const drawSymbolW = (ctx: CanvasRenderingContext2D, size: number) => {
	const cx = size / 2;
	const cy = size / 2 - 2;

	ctx.save();

	// 1. Trophy Handles (left & right ears)
	const drawHandle = (isLeft: boolean) => {
		const sign = isLeft ? -1 : 1;
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(cx + sign * 20, cy - 24);
		ctx.bezierCurveTo(
			cx + sign * 54,
			cy - 36,
			cx + sign * 50,
			cy + 10,
			cx + sign * 18,
			cy + 4,
		);
		ctx.strokeStyle = '#050a06';
		ctx.lineWidth = 7;
		ctx.stroke();

		const hGrad = ctx.createLinearGradient(cx, cy - 24, cx + sign * 50, cy);
		hGrad.addColorStop(0, '#fde047');
		hGrad.addColorStop(0.5, '#eab308');
		hGrad.addColorStop(1, '#a16207');
		ctx.strokeStyle = hGrad;
		ctx.lineWidth = 4;
		ctx.stroke();
		ctx.restore();
	};

	drawHandle(true);
	drawHandle(false);

	// 2. Marble Pedestal Base
	const baseY = cy + 30;
	ctx.beginPath();
	ctx.roundRect(cx - 30, baseY, 60, 16, 4);
	ctx.fillStyle = '#1e1b18';
	ctx.strokeStyle = '#050a06';
	ctx.lineWidth = 4.5;
	ctx.fill();
	ctx.stroke();

	// Gold Plaque on base
	ctx.beginPath();
	ctx.roundRect(cx - 22, baseY + 3, 44, 9, 2);
	ctx.fillStyle = '#eab308';
	ctx.fill();

	// 3. Trophy Cup Goblet & Stem
	ctx.beginPath();
	// Cup rim
	ctx.moveTo(cx - 28, cy - 28);
	ctx.lineTo(cx + 28, cy - 28);
	// Bowl curve
	ctx.quadraticCurveTo(cx + 26, cy + 8, cx + 10, cy + 18);
	// Stem
	ctx.lineTo(cx + 8, baseY);
	ctx.lineTo(cx - 8, baseY);
	ctx.lineTo(cx - 10, cy + 18);
	ctx.quadraticCurveTo(cx - 26, cy + 8, cx - 28, cy - 28);
	ctx.closePath();

	ctx.fillStyle = '#050a06';
	ctx.lineWidth = 5;
	ctx.stroke();

	// 24K Gold Gradient Fill
	const goldGrad = ctx.createLinearGradient(cx - 26, 0, cx + 26, 0);
	goldGrad.addColorStop(0, '#ca8a04');
	goldGrad.addColorStop(0.2, '#fde047');
	goldGrad.addColorStop(0.5, '#ffffff');
	goldGrad.addColorStop(0.8, '#eab308');
	goldGrad.addColorStop(1, '#854d0e');
	ctx.fillStyle = goldGrad;
	ctx.fill();

	// Cup Rim Ellipse
	ctx.beginPath();
	ctx.ellipse(cx, cy - 28, 28, 6.5, 0, 0, Math.PI * 2);
	ctx.fillStyle = '#fef08a';
	ctx.strokeStyle = '#050a06';
	ctx.lineWidth = 3.5;
	ctx.fill();
	ctx.stroke();

	// Champion Golf Ball perched inside cup
	drawGolfBall(ctx, cx, cy - 32, 13, true);

	// 4. Prominent WILD Badge Ribbon
	const ribbonY = cy + 4;
	ctx.beginPath();
	ctx.roundRect(cx - 36, ribbonY - 10, 72, 22, 6);
	ctx.fillStyle = '#dc2626';
	ctx.strokeStyle = '#050a06';
	ctx.lineWidth = 4;
	ctx.fill();
	ctx.stroke();

	// Inner gold border on ribbon
	ctx.beginPath();
	ctx.roundRect(cx - 33, ribbonY - 7, 66, 16, 4);
	ctx.strokeStyle = '#fde047';
	ctx.lineWidth = 1.6;
	ctx.stroke();

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = '900 13px system-ui, -apple-system, sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText('WILD', cx, ribbonY + 1);

	// Star sparkle glint on the rim
	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.arc(cx - 20, cy - 28, 2.5, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
};

/**
 * Render S: Green avec trou et drapeau rouge n°18
 */
const drawSymbolS = (ctx: CanvasRenderingContext2D, size: number) => {
	const cx = size / 2;
	const cy = size / 2 - 2;

	ctx.save();

	// 1. Putting Green Mound
	const greenY = cy + 24;
	ctx.beginPath();
	ctx.ellipse(cx, greenY, 52, 20, 0, 0, Math.PI * 2);
	ctx.fillStyle = '#050f09';
	ctx.lineWidth = 5;
	ctx.stroke();

	const greenGrad = ctx.createRadialGradient(cx, greenY - 4, 6, cx, greenY, 52);
	greenGrad.addColorStop(0, '#4ade80');
	greenGrad.addColorStop(0.65, '#16a34a');
	greenGrad.addColorStop(1, '#14532d');
	ctx.fillStyle = greenGrad;
	ctx.fill();

	// 2. The Hole (Cup)
	const holeX = cx - 12;
	const holeY = greenY;
	ctx.beginPath();
	ctx.ellipse(holeX, holeY, 15, 7.5, 0, 0, Math.PI * 2);
	ctx.fillStyle = '#020603';
	ctx.fill();
	ctx.strokeStyle = '#e2e8f0';
	ctx.lineWidth = 2.2;
	ctx.stroke();

	// 3. Flagstick Pole
	ctx.strokeStyle = '#050f09';
	ctx.lineWidth = 5;
	ctx.beginPath();
	ctx.moveTo(holeX, holeY);
	ctx.lineTo(holeX, cy - 44);
	ctx.stroke();

	ctx.strokeStyle = '#e2e8f0';
	ctx.lineWidth = 2.8;
	ctx.beginPath();
	ctx.moveTo(holeX, holeY);
	ctx.lineTo(holeX, cy - 44);
	ctx.stroke();

	// Gold finial sphere on top
	ctx.beginPath();
	ctx.arc(holeX, cy - 44, 3.5, 0, Math.PI * 2);
	ctx.fillStyle = '#fde047';
	ctx.fill();

	// 4. Waving Red Flag #18
	ctx.beginPath();
	ctx.moveTo(holeX, cy - 42);
	ctx.quadraticCurveTo(holeX + 22, cy - 48, holeX + 44, cy - 40);
	ctx.lineTo(holeX + 40, cy - 18);
	ctx.quadraticCurveTo(holeX + 20, cy - 24, holeX, cy - 20);
	ctx.closePath();

	ctx.fillStyle = '#050f09';
	ctx.lineWidth = 4;
	ctx.stroke();

	const flagGrad = ctx.createLinearGradient(holeX, 0, holeX + 44, 0);
	flagGrad.addColorStop(0, '#ef4444');
	flagGrad.addColorStop(0.5, '#dc2626');
	flagGrad.addColorStop(1, '#b91c1c');
	ctx.fillStyle = flagGrad;
	ctx.fill();

	// Embroidered "18" on flag
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = '900 13px system-ui, -apple-system, sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText('18', holeX + 21, cy - 30);

	// 5. Golf ball perched right on the edge of the hole!
	drawGolfBall(ctx, holeX + 16, holeY - 4, 11, false);

	// 6. SCATTER Banner
	const bannerY = greenY + 12;
	ctx.beginPath();
	ctx.roundRect(cx - 38, bannerY - 8, 76, 18, 5);
	ctx.fillStyle = '#831843';
	ctx.strokeStyle = '#050f09';
	ctx.lineWidth = 3.5;
	ctx.fill();
	ctx.stroke();

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = '900 10.5px system-ui, -apple-system, sans-serif';
	ctx.fillStyle = '#fde047';
	ctx.letterSpacing = '1px';
	ctx.fillText('SCATTER', cx, bannerY + 1);

	ctx.restore();
};

/**
 * Render M: Balle de golf dorée entourée d'une aura d'énergie selon le multiplicateur
 */
const drawSymbolM = (ctx: CanvasRenderingContext2D, size: number, mult: number) => {
	const cx = size / 2;
	const cy = size / 2;

	ctx.save();

	// Aura Color based on value
	const isHigh = mult >= 50;
	const isMid = mult >= 10;
	const primaryColor = isHigh ? '#ff0055' : isMid ? '#fbbf24' : '#00ff88';
	const secondaryColor = isHigh ? '#f43f5e' : isMid ? '#d97706' : '#059669';

	// 1. Swirling Outer Energy Rings
	ctx.save();
	ctx.translate(cx, cy);

	for (let i = 0; i < 3; i++) {
		ctx.rotate((Math.PI * 2) / 3);
		ctx.beginPath();
		ctx.ellipse(0, 0, 48, 22, (i * Math.PI) / 4, 0, Math.PI * 2);
		ctx.strokeStyle = primaryColor;
		ctx.lineWidth = 2.5;
		ctx.globalAlpha = 0.45;
		ctx.stroke();
	}

	// Pulsing Core Glow
	const glowGrad = ctx.createRadialGradient(0, 0, 16, 0, 0, 48);
	glowGrad.addColorStop(0, primaryColor);
	glowGrad.addColorStop(0.6, secondaryColor);
	glowGrad.addColorStop(1, 'transparent');
	ctx.fillStyle = glowGrad;
	ctx.globalAlpha = 0.35;
	ctx.beginPath();
	ctx.arc(0, 0, 48, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();

	// 2. Center Golden Golf Ball
	ctx.globalAlpha = 1.0;
	drawGolfBall(ctx, cx, cy, 34, true);

	// 3. Huge Bold Multiplier Value Text in center
	const multText = `x${mult}`;
	const fontSize = mult >= 100 ? 25 : mult >= 10 ? 28 : 32;

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;

	// Outer black shadow & stroke for 100% legibility
	ctx.strokeStyle = '#000000';
	ctx.lineWidth = 6;
	ctx.lineJoin = 'round';
	ctx.strokeText(multText, cx, cy + 1);

	// Text Fill
	ctx.fillStyle = '#ffffff';
	ctx.fillText(multText, cx, cy + 1);

	ctx.restore();
};

/**
 * Render Low Pays (10, J, Q, K, A) with Golf Green grass texture & golf ball dimples
 */
const drawSymbolLow = (
	ctx: CanvasRenderingContext2D,
	size: number,
	style: SymbolStyleConfig,
	isWinning: boolean,
) => {
	const cx = size / 2;
	const cy = size / 2 - 2;

	ctx.save();

	// 1. Center Emblem Background (Oval / Shield badge)
	const badgeR = 38;
	ctx.beginPath();
	ctx.arc(cx, cy, badgeR, 0, Math.PI * 2);
	ctx.fillStyle = '#05100a';
	ctx.lineWidth = 4;
	ctx.stroke();

	// Grass / Fairway Gradient
	const bgGrad = ctx.createRadialGradient(cx, cy - 8, 4, cx, cy, badgeR);
	bgGrad.addColorStop(0, style.accentColor);
	bgGrad.addColorStop(0.7, '#0f291e');
	bgGrad.addColorStop(1, '#05140e');
	ctx.fillStyle = bgGrad;
	ctx.fill();

	// Subtle golf ball dimples on the emblem background
	drawDimplePattern(ctx, cx, cy, badgeR - 2, 'rgba(255, 255, 255, 0.18)');

	// Inner metallic ring
	ctx.beginPath();
	ctx.arc(cx, cy, badgeR - 3, 0, Math.PI * 2);
	ctx.strokeStyle = isWinning ? '#ffffff' : style.accentColor;
	ctx.lineWidth = 2;
	ctx.stroke();

	// 2. Bold Stylized Cartoon Letter/Number
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = `900 ${style.fontSize * 1.5}px system-ui, -apple-system, sans-serif`;

	// Thick black outline
	ctx.strokeStyle = '#050f09';
	ctx.lineWidth = 7;
	ctx.lineJoin = 'round';
	ctx.strokeText(style.mainText, cx, cy);

	// Letter Gradient Fill
	const textGrad = ctx.createLinearGradient(0, cy - 24, 0, cy + 24);
	textGrad.addColorStop(0, '#ffffff');
	textGrad.addColorStop(0.4, isWinning ? '#fef08a' : '#f1f5f9');
	textGrad.addColorStop(1, style.accentColor);
	ctx.fillStyle = textGrad;
	ctx.fillText(style.mainText, cx, cy);

	// Sub-label badge
	if (style.subText) {
		const labelY = size - 22;
		ctx.font = '800 10px system-ui, -apple-system, sans-serif';
		ctx.letterSpacing = '1.5px';
		ctx.fillStyle = isWinning ? '#ffffff' : style.accentColor;
		ctx.fillText(style.subText, cx, labelY);
	}

	ctx.restore();
};

const textureCache = new Map<string, PIXI.Texture>();

export const createSymbolTexture = (rawSymbol: RawSymbol, isWinning = false): PIXI.Texture => {
	if (typeof document === 'undefined') {
		return PIXI.Texture.EMPTY;
	}

	const key = `${rawSymbol.name}_${rawSymbol.multiplier ?? ''}_${isWinning ? 'win' : 'normal'}`;
	const style = getSymbolStyle(rawSymbol);
	const canvas = document.createElement('canvas');
	const BASE_SIZE = 184;
	const RESOLUTION = 1.5; // Optimized 1.5x resolution for stutter-free 60 FPS on MacBook Air
	const size = Math.round(92 * RESOLUTION); // 138px
	canvas.width = size;
	canvas.height = size;

	const ctx = canvas.getContext('2d');
	if (!ctx) return PIXI.Texture.EMPTY;

	// Scale context to draw with the 184px vector coordinate space at 1.5x resolution
	ctx.scale(size / BASE_SIZE, size / BASE_SIZE);

	// 1. Main Tile Background Card
	const margin = 6;
	const bodySize = BASE_SIZE - margin * 2;
	const radius = 24;

	drawRoundRect(ctx, margin, margin, bodySize, bodySize, radius);

	// Tile body gradient
	const tileGrad = ctx.createLinearGradient(0, margin, 0, margin + bodySize);
	tileGrad.addColorStop(0, '#0f1d16');
	tileGrad.addColorStop(1, '#050c08');
	ctx.fillStyle = tileGrad;
	ctx.fill();

	// Outer Cartoon Black Border (Pre-baked stroke, zero GPU shadowBlur overhead)
	ctx.strokeStyle = '#040906';
	ctx.lineWidth = 5;
	ctx.stroke();

	// Inner Theme Border
	drawRoundRect(ctx, margin + 2.5, margin + 2.5, bodySize - 5, bodySize - 5, radius - 2);
	ctx.strokeStyle = isWinning ? '#ffffff' : style.accentColor;
	ctx.lineWidth = isWinning ? 3.5 : 2;
	ctx.stroke();

	// Top Bevel Glint
	drawRoundRect(ctx, margin + 12, margin + 6, bodySize - 24, 4, 2);
	ctx.fillStyle = isWinning ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.25)';
	ctx.fill();

	// 2. Specific Cartoon Vector Art by Symbol Name
	const symName = rawSymbol.name;
	switch (symName) {
		case 'H4':
			drawSymbolH4(ctx, BASE_SIZE);
			break;
		case 'H3':
			drawSymbolH3(ctx, BASE_SIZE);
			break;
		case 'H2':
			drawSymbolH2(ctx, BASE_SIZE);
			break;
		case 'H1':
			drawSymbolH1(ctx, BASE_SIZE);
			break;
		case 'W':
			drawSymbolW(ctx, BASE_SIZE);
			break;
		case 'S':
			drawSymbolS(ctx, BASE_SIZE);
			break;
		case 'M':
			drawSymbolM(ctx, BASE_SIZE, rawSymbol.multiplier ?? 2);
			break;
		case 'L1':
		case 'L2':
		case 'L3':
		case 'L4':
		case 'L5':
		default:
			drawSymbolLow(ctx, BASE_SIZE, style, isWinning);
			break;
	}

	const dataUrl = canvas.toDataURL();
	dataUrlCache.set(key, dataUrl);

	const texture = PIXI.Texture.from(canvas);
	if (texture.source) {
		texture.source.resolution = RESOLUTION;
	}

	return texture;
};


const dataUrlCache = new Map<string, string>();

export const getSymbolDataUrl = (rawSymbol: RawSymbol): string => {
	const key = `${rawSymbol.name}_${rawSymbol.multiplier ?? ''}_normal`;
	let cached = dataUrlCache.get(key);
	if (!cached) {
		createSymbolTexture(rawSymbol, false);
		cached = dataUrlCache.get(key) || '';
	}
	return cached;
};

export const getSymbolTexture = (rawSymbol: RawSymbol, isWinning = false): PIXI.Texture => {
	const key = `${rawSymbol.name}_${rawSymbol.multiplier ?? ''}_${isWinning ? 'win' : 'normal'}`;
	let cached = textureCache.get(key);
	if (!cached) {
		cached = createSymbolTexture(rawSymbol, isWinning);
		textureCache.set(key, cached);
	}
	return cached;
};

export const pregenerateSymbolTextures = () => {
	if (typeof document === 'undefined') return;

	const symbols: RawSymbol[] = [
		{ name: 'L1' },
		{ name: 'L2' },
		{ name: 'L3' },
		{ name: 'L4' },
		{ name: 'L5' },
		{ name: 'H1' },
		{ name: 'H2' },
		{ name: 'H3' },
		{ name: 'H4' },
		{ name: 'W' },
		{ name: 'S' },
		{ name: 'M', multiplier: 2 },
		{ name: 'M', multiplier: 3 },
		{ name: 'M', multiplier: 5 },
		{ name: 'M', multiplier: 10 },
		{ name: 'M', multiplier: 25 },
		{ name: 'M', multiplier: 50 },
		{ name: 'M', multiplier: 100 },
	];

	for (const sym of symbols) {
		getSymbolTexture(sym, false);
		getSymbolTexture(sym, true);
	}
};

