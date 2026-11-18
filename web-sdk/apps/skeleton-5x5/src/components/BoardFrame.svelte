<script lang="ts" module>
	import { PIXI } from 'pixi-svelte';

	export type EmitterEventBoardFrame =
		| { type: 'boardFrameGlowShow' }
		| { type: 'boardFrameGlowHide' };

	let cachedBaseFrameTexture: PIXI.Texture | null = null;
	let cachedGlowFrameTexture: PIXI.Texture | null = null;

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

	const createBoardFrameTexture = (isGlow: boolean): PIXI.Texture => {
		if (typeof document === 'undefined') return PIXI.Texture.EMPTY;

		if (isGlow && cachedGlowFrameTexture) return cachedGlowFrameTexture;
		if (!isGlow && cachedBaseFrameTexture) return cachedBaseFrameTexture;

		const RESOLUTION = 1.5;
		const BASE_W = 560;
		const BASE_H = 620;
		const width = Math.round(BASE_W * RESOLUTION);
		const height = Math.round(BASE_H * RESOLUTION);

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext('2d');
		if (!ctx) return PIXI.Texture.EMPTY;

		ctx.scale(RESOLUTION, RESOLUTION);

		const cx = BASE_W / 2; // 280
		const cy = BASE_H / 2; // 310

		// 1. Golden Aura Glow in Free Spins / Big Wins
		if (isGlow) {
			const glowSize = 544;
			drawRoundRect(ctx, cx - glowSize / 2, cy - glowSize / 2, glowSize, glowSize, 28);
			ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
			ctx.fill();
			ctx.strokeStyle = 'rgba(255, 224, 102, 0.9)';
			ctx.lineWidth = 3;
			ctx.stroke();
		}

		// 2. Outer Frame Panel (Anthracite / Brushed Silver Metallic with Golf Green Trim)
		const outerSize = 534;
		drawRoundRect(ctx, cx - outerSize / 2, cy - outerSize / 2, outerSize, outerSize, 22);
		ctx.fillStyle = '#0b1410';
		ctx.fill();
		ctx.strokeStyle = isGlow ? '#facc15' : '#2e4036';
		ctx.lineWidth = isGlow ? 3 : 2.5;
		ctx.stroke();

		// 3. Inner Metallic Bevel
		const bevelSize = 526;
		drawRoundRect(ctx, cx - bevelSize / 2, cy - bevelSize / 2, bevelSize, bevelSize, 18);
		ctx.fillStyle = '#050e09';
		ctx.fill();
		ctx.strokeStyle = '#1e3a2c';
		ctx.lineWidth = 1.5;
		ctx.stroke();

		// 4. Inner Board Putting Green Turf Surface
		const turfSize = 504;
		drawRoundRect(ctx, cx - turfSize / 2, cy - turfSize / 2, turfSize, turfSize, 14);
		ctx.fillStyle = '#071e14';
		ctx.fill();
		ctx.strokeStyle = '#154730';
		ctx.lineWidth = 1.5;
		ctx.stroke();

		// 5. Putting Green Alternating Mowed Stripes for 5 Columns
		const boardLeft = cx - 250;
		const boardTop = cy - 250;
		for (let col = 0; col < 5; col += 2) {
			ctx.fillStyle = 'rgba(10, 40, 27, 0.5)';
			ctx.fillRect(boardLeft + col * 100, boardTop, 100, 500);
		}

		// 6. Column Dividers (Fine Fairway Green Seams)
		ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
		for (let col = 1; col < 5; col++) {
			ctx.fillRect(boardLeft + col * 100 - 0.75, boardTop, 1.5, 500);
		}

		// 7. Row Dividers
		ctx.fillStyle = 'rgba(20, 83, 45, 0.25)';
		for (let row = 1; row < 5; row++) {
			ctx.fillRect(boardLeft, boardTop + row * 100 - 0.5, 500, 1);
		}

		// 8. Top Frame Crest: Putting Cup with Ball & Giant Pink/Cyan Tees
		const crestY = cy - 264;

		// Arch Badge
		ctx.beginPath();
		ctx.roundRect(cx - 80, crestY - 24, 160, 32, 12);
		ctx.fillStyle = '#0f1713';
		ctx.strokeStyle = '#334155';
		ctx.lineWidth = 3.5;
		ctx.fill();
		ctx.stroke();

		// Inner gold trim on badge
		ctx.beginPath();
		ctx.roundRect(cx - 76, crestY - 20, 152, 24, 8);
		ctx.strokeStyle = '#eab308';
		ctx.lineWidth = 1.6;
		ctx.stroke();

		// Center Cup (Hole)
		ctx.beginPath();
		ctx.ellipse(cx, crestY - 8, 22, 9, 0, 0, Math.PI * 2);
		ctx.fillStyle = '#020604';
		ctx.fill();
		ctx.strokeStyle = '#f1f5f9';
		ctx.lineWidth = 2.2;
		ctx.stroke();

		// Center Golf Ball nestled in cup
		const ballR = 14;
		const ballX = cx;
		const ballY = crestY - 14;

		ctx.beginPath();
		ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
		ctx.fillStyle = '#050a06';
		ctx.fill();

		const bGrad = ctx.createRadialGradient(ballX - 4, ballY - 4, 2, ballX, ballY, ballR);
		bGrad.addColorStop(0, '#ffffff');
		bGrad.addColorStop(0.5, '#f8fafc');
		bGrad.addColorStop(0.85, '#cbd5e1');
		bGrad.addColorStop(1, '#64748b');
		ctx.beginPath();
		ctx.arc(ballX, ballY, ballR - 2.5, 0, Math.PI * 2);
		ctx.fillStyle = bGrad;
		ctx.fill();

		// Dimples
		ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
		for (let dy = -8; dy <= 8; dy += 5) {
			for (let dx = -8; dx <= 8; dx += 5) {
				if (dx * dx + dy * dy < 80) {
					ctx.beginPath();
					ctx.arc(ballX + dx, ballY + dy, 1.3, 0, Math.PI * 2);
					ctx.fill();
				}
			}
		}

		// Ball specular shine
		ctx.beginPath();
		ctx.ellipse(ballX - 4, ballY - 4, 5, 2.5, -Math.PI / 4, 0, Math.PI * 2);
		ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
		ctx.fill();

		// Helper to draw Giant Golf Tees
		const drawGiantTee = (tx: number, ty: number, rot: number, mainCol: string, lightCol: string) => {
			ctx.save();
			ctx.translate(tx, ty);
			ctx.rotate(rot);

			// Outline
			ctx.beginPath();
			ctx.moveTo(-16, -26);
			ctx.quadraticCurveTo(0, -23, 16, -26);
			ctx.lineTo(12, -18);
			ctx.quadraticCurveTo(6, -10, 5, 0);
			ctx.lineTo(3.5, 28);
			ctx.quadraticCurveTo(0, 36, -3.5, 28);
			ctx.lineTo(-5, 0);
			ctx.quadraticCurveTo(-6, -10, -12, -18);
			ctx.closePath();
			ctx.fillStyle = '#050a06';
			ctx.lineWidth = 4.5;
			ctx.stroke();

			// Fill
			const tGrad = ctx.createLinearGradient(-14, 0, 14, 0);
			tGrad.addColorStop(0, mainCol);
			tGrad.addColorStop(0.4, lightCol);
			tGrad.addColorStop(1, mainCol);
			ctx.fillStyle = tGrad;
			ctx.fill();

			// Cup Rim
			ctx.beginPath();
			ctx.ellipse(0, -25, 14, 4.5, 0, 0, Math.PI * 2);
			ctx.fillStyle = lightCol;
			ctx.fill();
			ctx.strokeStyle = '#050a06';
			ctx.lineWidth = 2.2;
			ctx.stroke();

			// Glint
			ctx.beginPath();
			ctx.moveTo(-3, -16);
			ctx.lineTo(-2, 18);
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
			ctx.lineWidth = 2.2;
			ctx.stroke();

			ctx.restore();
		};

		// Giant Hot Pink Tee (Left)
		drawGiantTee(cx - 105, crestY - 8, -0.38, '#be185d', '#f472b6');

		// Giant Electric Cyan Tee (Right)
		drawGiantTee(cx + 105, crestY - 8, 0.38, '#0284c7', '#38bdf8');

		// 9. Bottom Frame Fresh Cut Grass Border
		const grassBaseY = cy + 264 + 16;
		const grassW = 540;
		const grassLeft = cx - grassW / 2;

		// Dark background grass blades
		ctx.fillStyle = '#14532d';
		ctx.beginPath();
		ctx.moveTo(grassLeft, grassBaseY);
		for (let x = 0; x <= grassW; x += 12) {
			const bladeH = 14 + (Math.sin(x * 0.3) * 6 + Math.cos(x * 0.15) * 4);
			ctx.lineTo(grassLeft + x + 4, grassBaseY - bladeH - 4);
			ctx.lineTo(grassLeft + x + 8, grassBaseY - 2);
		}
		ctx.lineTo(grassLeft + grassW, grassBaseY);
		ctx.closePath();
		ctx.fill();

		// Foreground brighter grass blades with cartoon outlines
		ctx.fillStyle = '#22c55e';
		ctx.strokeStyle = '#051208';
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.moveTo(grassLeft, grassBaseY);
		for (let x = 4; x <= grassW; x += 14) {
			const bladeH = 16 + Math.cos(x * 0.25) * 7;
			ctx.lineTo(grassLeft + x + 5, grassBaseY - bladeH);
			ctx.lineTo(grassLeft + x + 10, grassBaseY - 3);
		}
		ctx.lineTo(grassLeft + grassW, grassBaseY);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Highlight lime tips
		ctx.fillStyle = '#86efac';
		for (let x = 4; x <= grassW; x += 28) {
			ctx.beginPath();
			ctx.moveTo(grassLeft + x + 4, grassBaseY - 18);
			ctx.lineTo(grassLeft + x + 6, grassBaseY - 22);
			ctx.lineTo(grassLeft + x + 8, grassBaseY - 17);
			ctx.closePath();
			ctx.fill();
		}

		const tex = PIXI.Texture.from(canvas);
		if (tex.source) tex.source.resolution = RESOLUTION;

		if (isGlow) cachedGlowFrameTexture = tex;
		else cachedBaseFrameTexture = tex;

		return tex;
	};
</script>

<script lang="ts">
	import { Container, BaseSprite } from 'pixi-svelte';
	import { getContext } from '../game/context';

	const context = getContext();
	let glowActive = $state(false);

	context.eventEmitter.subscribeOnMount({
		boardFrameGlowShow: () => {
			glowActive = true;
		},
		boardFrameGlowHide: () => {
			glowActive = false;
		},
	});

	const boardLayout = $derived(context.stateGameDerived.boardLayout());

	let baseFrameTexture = $state<PIXI.Texture | null>(cachedBaseFrameTexture);
	let glowFrameTexture = $state<PIXI.Texture | null>(cachedGlowFrameTexture);

	$effect(() => {
		if (!baseFrameTexture) baseFrameTexture = createBoardFrameTexture(false);
		if (!glowFrameTexture) glowFrameTexture = createBoardFrameTexture(true);
	});
</script>

<!-- High-Performance Single-Texture Board Frame (Zero per-frame Graphics draw calls) -->
<Container x={boardLayout.x} y={boardLayout.y} scale={boardLayout.scale ?? 1}>
	{#if glowActive && glowFrameTexture}
		<BaseSprite
			texture={glowFrameTexture}
			anchor={0.5}
			x={0}
			y={0}
			width={560}
			height={620}
		/>
	{:else if baseFrameTexture}
		<BaseSprite
			texture={baseFrameTexture}
			anchor={0.5}
			x={0}
			y={0}
			width={560}
			height={620}
		/>
	{/if}
</Container>
