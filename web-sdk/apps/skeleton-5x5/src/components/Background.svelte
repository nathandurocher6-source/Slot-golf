<script lang="ts" module>
	let cachedBaseTexture: PIXI.Texture | null = null;
	let cachedFeatureTexture: PIXI.Texture | null = null;
</script>

<script lang="ts">
	import { Container, Rectangle, BaseSprite, PIXI } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { SECOND } from 'constants-shared/time';
	import { getContext } from '../game/context';

	const context = getContext();
	const canvasSizes = $derived(context.stateLayoutDerived.canvasSizes());
	const showBaseBackground = $derived(context.stateGame.gameType === 'basegame');
	const showFeatureBackground = $derived(context.stateGame.gameType === 'freegame');

	let baseTexture = $state<PIXI.Texture | null>(cachedBaseTexture);
	let featureTexture = $state<PIXI.Texture | null>(cachedFeatureTexture);

	const generateGolfCourseTexture = (isFeature: boolean): PIXI.Texture => {
		if (typeof document === 'undefined') return PIXI.Texture.EMPTY;
		if (isFeature && cachedFeatureTexture) return cachedFeatureTexture;
		if (!isFeature && cachedBaseTexture) return cachedBaseTexture;

		const width = 1600;
		const height = 900;
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (!ctx) return PIXI.Texture.EMPTY;

		if (!isFeature) {
			// ==========================================
			// 1. DAYTIME SUNNY CHAMPIONSHIP COURSE
			// ==========================================

			// Sky Gradient
			const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
			skyGrad.addColorStop(0, '#38bdf8'); // Azure Sky
			skyGrad.addColorStop(0.5, '#7dd3fc');
			skyGrad.addColorStop(0.85, '#bae6fd');
			skyGrad.addColorStop(1, '#e0f2fe');
			ctx.fillStyle = skyGrad;
			ctx.fillRect(0, 0, width, height);

			// Warm Smiling Cartoon Sun
			const sunX = width * 0.85;
			const sunY = height * 0.18;

			// Sun Corona / Rays
			const sunCorona = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, 140);
			sunCorona.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
			sunCorona.addColorStop(0.5, 'rgba(253, 224, 71, 0.25)');
			sunCorona.addColorStop(1, 'transparent');
			ctx.fillStyle = sunCorona;
			ctx.beginPath();
			ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
			ctx.fill();

			// Sun Disc
			ctx.beginPath();
			ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
			ctx.fillStyle = '#fde047';
			ctx.fill();
			ctx.strokeStyle = '#eab308';
			ctx.lineWidth = 4;
			ctx.stroke();

			// Fluffy Cartoon Clouds
			const drawCloud = (cx: number, cy: number, scale: number) => {
				ctx.save();
				ctx.translate(cx, cy);
				ctx.scale(scale, scale);

				// Cloud bottom shadow
				ctx.fillStyle = 'rgba(203, 213, 225, 0.5)';
				ctx.beginPath();
				ctx.arc(-40, 6, 32, 0, Math.PI * 2);
				ctx.arc(0, 8, 42, 0, Math.PI * 2);
				ctx.arc(42, 6, 30, 0, Math.PI * 2);
				ctx.arc(80, 8, 22, 0, Math.PI * 2);
				ctx.fill();

				// White Cloud Puffs
				ctx.fillStyle = '#ffffff';
				ctx.beginPath();
				ctx.arc(-40, 0, 32, 0, Math.PI * 2);
				ctx.arc(0, -10, 42, 0, Math.PI * 2);
				ctx.arc(42, -4, 30, 0, Math.PI * 2);
				ctx.arc(80, 2, 22, 0, Math.PI * 2);
				ctx.fill();

				ctx.restore();
			};

			drawCloud(width * 0.15, height * 0.16, 1.1);
			drawCloud(width * 0.48, height * 0.12, 0.85);
			drawCloud(width * 0.72, height * 0.24, 0.75);

			// Distant Mountain Ridges / Forest Haze
			ctx.fillStyle = '#99f6e4';
			ctx.globalAlpha = 0.45;
			ctx.beginPath();
			ctx.moveTo(0, height * 0.48);
			ctx.quadraticCurveTo(width * 0.25, height * 0.42, width * 0.5, height * 0.46);
			ctx.quadraticCurveTo(width * 0.75, height * 0.40, width, height * 0.45);
			ctx.lineTo(width, height);
			ctx.lineTo(0, height);
			ctx.closePath();
			ctx.fill();
			ctx.globalAlpha = 1.0;

			// Far Hills (Dark Emerald Grass)
			ctx.fillStyle = '#15803d';
			ctx.beginPath();
			ctx.moveTo(0, height * 0.52);
			ctx.quadraticCurveTo(width * 0.3, height * 0.44, width * 0.6, height * 0.50);
			ctx.quadraticCurveTo(width * 0.85, height * 0.54, width, height * 0.48);
			ctx.lineTo(width, height);
			ctx.lineTo(0, height);
			ctx.closePath();
			ctx.fill();

			// Distant Trees on Far Hills
			const drawFarTree = (tx: number, ty: number, h: number) => {
				ctx.fillStyle = '#14532d';
				ctx.beginPath();
				ctx.arc(tx, ty - h * 0.7, h * 0.5, 0, Math.PI * 2);
				ctx.arc(tx - h * 0.25, ty - h * 0.5, h * 0.4, 0, Math.PI * 2);
				ctx.arc(tx + h * 0.25, ty - h * 0.5, h * 0.4, 0, Math.PI * 2);
				ctx.fill();
			};

			drawFarTree(width * 0.12, height * 0.50, 24);
			drawFarTree(width * 0.15, height * 0.49, 28);
			drawFarTree(width * 0.18, height * 0.50, 22);
			drawFarTree(width * 0.58, height * 0.50, 26);
			drawFarTree(width * 0.62, height * 0.51, 30);
			drawFarTree(width * 0.88, height * 0.50, 26);

			// Mid Hill with Far Flag n°18
			ctx.fillStyle = '#16a34a';
			ctx.beginPath();
			ctx.moveTo(0, height * 0.60);
			ctx.quadraticCurveTo(width * 0.35, height * 0.52, width * 0.7, height * 0.62);
			ctx.quadraticCurveTo(width * 0.88, height * 0.66, width, height * 0.58);
			ctx.lineTo(width, height);
			ctx.lineTo(0, height);
			ctx.closePath();
			ctx.fill();

			// Distant Red Flag on hill crest
			const flagPoleX = width * 0.34;
			const flagPoleY = height * 0.525;
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 2.5;
			ctx.beginPath();
			ctx.moveTo(flagPoleX, flagPoleY);
			ctx.lineTo(flagPoleX, flagPoleY - 26);
			ctx.stroke();

			ctx.fillStyle = '#ef4444';
			ctx.beginPath();
			ctx.moveTo(flagPoleX, flagPoleY - 26);
			ctx.lineTo(flagPoleX + 16, flagPoleY - 20);
			ctx.lineTo(flagPoleX, flagPoleY - 14);
			ctx.closePath();
			ctx.fill();

			// Shimmering Blue Golf Lake / Water Hazard
			const lakeGrad = ctx.createLinearGradient(width * 0.05, height * 0.62, width * 0.25, height * 0.72);
			lakeGrad.addColorStop(0, '#0284c7');
			lakeGrad.addColorStop(0.5, '#38bdf8');
			lakeGrad.addColorStop(1, '#0369a1');
			ctx.fillStyle = lakeGrad;
			ctx.beginPath();
			ctx.ellipse(width * 0.15, height * 0.68, width * 0.12, height * 0.07, -0.1, 0, Math.PI * 2);
			ctx.fill();
			ctx.strokeStyle = '#22c55e';
			ctx.lineWidth = 5;
			ctx.stroke();

			// Lake cartoon ripples
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(width * 0.14, height * 0.67, 24, 0.2, 1.4);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(width * 0.17, height * 0.69, 18, 0.1, 1.2);
			ctx.stroke();

			// Foreground Lush Green Fairway & Putting Green
			const fgGrad = ctx.createLinearGradient(0, height * 0.66, 0, height);
			fgGrad.addColorStop(0, '#22c55e');
			fgGrad.addColorStop(0.5, '#16a34a');
			fgGrad.addColorStop(1, '#15803d');
			ctx.fillStyle = fgGrad;
			ctx.beginPath();
			ctx.moveTo(0, height * 0.68);
			ctx.quadraticCurveTo(width * 0.25, height * 0.74, width * 0.55, height * 0.68);
			ctx.quadraticCurveTo(width * 0.8, height * 0.62, width, height * 0.70);
			ctx.lineTo(width, height);
			ctx.lineTo(0, height);
			ctx.closePath();
			ctx.fill();

			// Golden Sand Bunker on Right
			const bunkerGrad = ctx.createRadialGradient(
				width * 0.82,
				height * 0.76,
				10,
				width * 0.82,
				height * 0.76,
				width * 0.11,
			);
			bunkerGrad.addColorStop(0, '#fef08a');
			bunkerGrad.addColorStop(0.7, '#fde047');
			bunkerGrad.addColorStop(1, '#ca8a04');
			ctx.fillStyle = bunkerGrad;
			ctx.beginPath();
			ctx.ellipse(width * 0.82, height * 0.76, width * 0.11, height * 0.055, 0.18, 0, Math.PI * 2);
			ctx.fill();
			ctx.strokeStyle = '#15803d';
			ctx.lineWidth = 6;
			ctx.stroke();

			// Foreground Oak Trees on Edges
			const drawBigTree = (tx: number, ty: number, scale: number) => {
				ctx.save();
				ctx.translate(tx, ty);
				ctx.scale(scale, scale);

				// Trunk
				ctx.fillStyle = '#78350f';
				ctx.strokeStyle = '#050a06';
				ctx.lineWidth = 5;
				ctx.beginPath();
				ctx.moveTo(-10, 0);
				ctx.quadraticCurveTo(-14, -60, -8, -120);
				ctx.lineTo(8, -120);
				ctx.quadraticCurveTo(14, -60, 10, 0);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();

				// Foliage Canopy Clumps
				const drawCanopyClump = (ox: number, oy: number, r: number, col: string) => {
					ctx.fillStyle = col;
					ctx.strokeStyle = '#050a06';
					ctx.lineWidth = 4.5;
					ctx.beginPath();
					ctx.arc(ox, oy, r, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();
				};

				drawCanopyClump(-35, -135, 45, '#15803d');
				drawCanopyClump(35, -130, 42, '#15803d');
				drawCanopyClump(0, -165, 52, '#22c55e');
				drawCanopyClump(-20, -180, 38, '#4ade80');
				drawCanopyClump(20, -175, 40, '#22c55e');

				ctx.restore();
			};

			drawBigTree(width * 0.06, height * 0.78, 1.05);
			drawBigTree(width * 0.94, height * 0.82, 1.15);
		} else {
			// ==========================================
			// 2. SUNSET / NIGHT STADIUM CHAMPIONSHIP
			// ==========================================

			// Dramatic Twilight Sunset
			const nightGrad = ctx.createLinearGradient(0, 0, 0, height * 0.7);
			nightGrad.addColorStop(0, '#1e1138'); // Deep Indigo
			nightGrad.addColorStop(0.35, '#4c1d95');
			nightGrad.addColorStop(0.65, '#b45309');
			nightGrad.addColorStop(0.85, '#f59e0b');
			nightGrad.addColorStop(1, '#fef08a');
			ctx.fillStyle = nightGrad;
			ctx.fillRect(0, 0, width, height);

			// Tournament Spotlight Beams
			const drawSpotlight = (sx: number, sy: number, ex: number, ey: number, w: number) => {
				const beamGrad = ctx.createLinearGradient(sx, sy, ex, ey);
				beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
				beamGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.3)');
				beamGrad.addColorStop(1, 'transparent');

				ctx.save();
				ctx.fillStyle = beamGrad;
				ctx.beginPath();
				ctx.moveTo(sx - 10, sy);
				ctx.lineTo(ex - w, ey);
				ctx.lineTo(ex + w, ey);
				ctx.lineTo(sx + 10, sy);
				ctx.closePath();
				ctx.fill();
				ctx.restore();
			};

			drawSpotlight(width * 0.12, height * 0.2, width * 0.35, height * 0.9, 140);
			drawSpotlight(width * 0.88, height * 0.2, width * 0.65, height * 0.9, 140);

			// Spotlight Towers
			const drawTower = (tx: number, ty: number) => {
				ctx.strokeStyle = '#e2e8f0';
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(tx - 14, ty + 120);
				ctx.lineTo(tx, ty);
				ctx.lineTo(tx + 14, ty + 120);
				ctx.stroke();

				// Floodlight bank
				ctx.fillStyle = '#ffffff';
				ctx.beginPath();
				ctx.roundRect(tx - 24, ty - 8, 48, 16, 4);
				ctx.fill();
				ctx.strokeStyle = '#0f172a';
				ctx.lineWidth = 3;
				ctx.stroke();

				// Floodlight glow
				const gGrad = ctx.createRadialGradient(tx, ty, 4, tx, ty, 45);
				gGrad.addColorStop(0, '#ffffff');
				gGrad.addColorStop(0.4, 'rgba(254, 240, 138, 0.8)');
				gGrad.addColorStop(1, 'transparent');
				ctx.fillStyle = gGrad;
				ctx.beginPath();
				ctx.arc(tx, ty, 45, 0, Math.PI * 2);
				ctx.fill();
			};

			drawTower(width * 0.12, height * 0.2);
			drawTower(width * 0.88, height * 0.2);

			// Evening Hills in rich illuminated emerald / violet
			ctx.fillStyle = '#064e3b';
			ctx.beginPath();
			ctx.moveTo(0, height * 0.54);
			ctx.quadraticCurveTo(width * 0.3, height * 0.46, width * 0.6, height * 0.52);
			ctx.quadraticCurveTo(width * 0.85, height * 0.56, width, height * 0.50);
			ctx.lineTo(width, height);
			ctx.lineTo(0, height);
			ctx.closePath();
			ctx.fill();

			// Foreground Illuminated Fairway Green
			const nightFg = ctx.createLinearGradient(0, height * 0.65, 0, height);
			nightFg.addColorStop(0, '#047857');
			nightFg.addColorStop(0.5, '#065f46');
			nightFg.addColorStop(1, '#022c22');
			ctx.fillStyle = nightFg;
			ctx.beginPath();
			ctx.moveTo(0, height * 0.66);
			ctx.quadraticCurveTo(width * 0.25, height * 0.72, width * 0.55, height * 0.66);
			ctx.quadraticCurveTo(width * 0.8, height * 0.60, width, height * 0.68);
			ctx.lineTo(width, height);
			ctx.lineTo(0, height);
			ctx.closePath();
			ctx.fill();
		}

		// Dark Center Vignette to make 5x5 Board Pop Crisp & Readable
		const centerVignette = ctx.createRadialGradient(
			width * 0.5,
			height * 0.5,
			220,
			width * 0.5,
			height * 0.5,
			width * 0.55,
		);
		centerVignette.addColorStop(0, 'transparent');
		centerVignette.addColorStop(0.65, 'rgba(6, 17, 12, 0.45)');
		centerVignette.addColorStop(1, 'rgba(3, 10, 7, 0.85)');
		ctx.fillStyle = centerVignette;
		ctx.fillRect(0, 0, width, height);

		const texture = PIXI.Texture.from(canvas);
		if (isFeature) cachedFeatureTexture = texture;
		else cachedBaseTexture = texture;
		return texture;
	};

	$effect(() => {
		if (!baseTexture) {
			baseTexture = generateGolfCourseTexture(false);
		}
		if (!featureTexture) {
			featureTexture = generateGolfCourseTexture(true);
		}
	});
</script>

<!-- Deep Dark Fallback Backdrop -->
<Rectangle {...canvasSizes} backgroundColor={0x07150e} zIndex={-6} />

<!-- Base Game Panoramic Golf Course -->
<FadeContainer show={showBaseBackground} duration={SECOND * 0.5} zIndex={-5}>
	{#if baseTexture}
		<BaseSprite
			texture={baseTexture}
			width={canvasSizes.width}
			height={canvasSizes.height}
			x={0}
			y={0}
		/>
	{/if}

	<!-- Board Ambient Focus Backdrop -->
	<Container x={canvasSizes.width * 0.5} y={canvasSizes.height * 0.5}>
		<Rectangle
			width={Math.min(canvasSizes.width * 0.88, 860)}
			height={Math.min(canvasSizes.height * 0.88, 860)}
			borderRadius={32}
			backgroundColor={0x061911}
			backgroundAlpha={0.65}
			borderColor={0x164e32}
			borderWidth={1.5}
			anchor={0.5}
		/>
	</Container>
</FadeContainer>

<!-- Free Spins Feature Night Tournament Golf Course -->
<FadeContainer show={showFeatureBackground} duration={SECOND * 0.5} zIndex={-4}>
	{#if featureTexture}
		<BaseSprite
			texture={featureTexture}
			width={canvasSizes.width}
			height={canvasSizes.height}
			x={0}
			y={0}
		/>
	{/if}

	<!-- Feature Glowing Golden/Emerald Ambient Frame -->
	<Container x={canvasSizes.width * 0.5} y={canvasSizes.height * 0.5}>
		<Rectangle
			width={Math.min(canvasSizes.width * 0.9, 900)}
			height={Math.min(canvasSizes.height * 0.9, 900)}
			borderRadius={36}
			backgroundColor={0x031c12}
			backgroundAlpha={0.75}
			borderColor={0xfacc15}
			borderWidth={2}
			borderAlpha={0.7}
			anchor={0.5}
		/>
	</Container>
</FadeContainer>
