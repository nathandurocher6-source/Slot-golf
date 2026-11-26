<script lang="ts">
	import { onDestroy } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { PIXI, getContextParent } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { PRACTICE_PLANES } from '../game/practicePlanes';
	import { studioTexture } from '../game/studioVisuals';

	const { enabled = true, sunset }: { enabled?: boolean; sunset: number } = $props();
	const SETTINGS = {
		firstPass: 7800,
		pause: [21000, 39000],
		duration: [6500, 9100],
		maxBirds: 4,
		frameWidth: 32,
		frameHeight: 20,
		frameCount: 3,
	};

	const context = getContext();
	const reduced = new MediaQuery('(prefers-reduced-motion: reduce)');
	const screen = $derived(context.stateLayoutDerived.canvasSizes());
	const atlas = studioTexture(context.stateApp.loadedAssets, 'practice-ambient-birds');
	const frames = Array.from(
		{ length: SETTINGS.frameCount },
		(_, index) =>
			new PIXI.Texture({
				source: atlas.source,
				frame: new PIXI.Rectangle(
					index * SETTINGS.frameWidth,
					0,
					SETTINGS.frameWidth,
					SETTINGS.frameHeight,
				),
			}),
	);
	const flock = new PIXI.Container({
		label: 'Ambient birds',
		zIndex: PRACTICE_PLANES.skyLife,
		visible: false,
	});
	const sprites = Array.from({ length: SETTINGS.maxBirds }, (_, index) => {
		const bird = new PIXI.Sprite({
			texture: frames[0],
			anchor: 0.5,
			label: `Ambient bird ${index + 1}`,
		});
		flock.addChild(bird);
		return bird;
	});
	getContextParent().addToParent(flock);

	const randomBetween = (min: number, max: number) => min + (max - min) * Math.random();
	const wingCycle = [0, 1, 2, 1];
	let inView = $state(true);
	let activeCount = 0;
	let delay: ReturnType<typeof setTimeout>;
	let duration = 0;
	let elapsed = 0;
	let flyRight = true;
	let flightY = 0;
	let flightCurve = 0;

	$effect(() => {
		flock.tint = sunset > 0.5 ? 0x45313d : 0x364b54;
	});

	$effect(() => {
		const app = context.stateApp.pixiApplication;
		if (!app) return;
		const observer = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting));
		observer.observe(app.canvas);
		return () => observer.disconnect();
	});

	$effect(() => {
		const app = context.stateApp.pixiApplication;
		if (!app || !enabled || reduced.current || !inView) return;
		const ticker = app.ticker;

		function stop() {
			clearTimeout(delay);
			ticker.remove(draw);
			flock.visible = false;
		}
		function schedule(wait: number) {
			if (!document.hidden) delay = setTimeout(launch, wait);
		}
		function launch() {
			activeCount = 2 + Math.floor(Math.random() * 3);
			flyRight = Math.random() < 0.55;
			flightY = randomBetween(0.08, 0.18);
			flightCurve = randomBetween(0.011, 0.034);
			duration = randomBetween(SETTINGS.duration[0], SETTINGS.duration[1]);
			elapsed = 0;
			for (let i = 0; i < sprites.length; i++) {
				sprites[i].visible = i < activeCount;
				sprites[i].alpha = randomBetween(0.42, 0.65);
			}
			flock.visible = true;
			ticker.add(draw);
		}
		function draw(tick: PIXI.Ticker) {
			elapsed += tick.deltaMS;
			if (elapsed >= duration) {
				stop();
				schedule(randomBetween(SETTINGS.pause[0], SETTINGS.pause[1]));
				return;
			}
			const progress = elapsed / duration;
			const direction = flyRight ? 1 : -1;
			const size = Math.min(18, Math.max(9, screen.width * 0.014));
			for (let i = 0; i < activeCount; i++) {
				const bird = sprites[i];
				const x = progress * (screen.width + 178) - 35 - i * size * 1.62;
				bird.position.set(
					flyRight ? x : screen.width - x,
					screen.height * (flightY - flightCurve * Math.sin(Math.PI * progress)) +
						i * size * 0.34 +
						Math.sin(progress * 7 + i) * 2,
				);
				const scale = (size * (1 - i * 0.058)) / SETTINGS.frameWidth;
				bird.scale.set(scale * direction, scale);
				bird.rotation = direction * (0.055 - progress * 0.095);
				bird.texture =
					frames[wingCycle[Math.floor(elapsed / (124 + 9 * i) + 2 * i) % wingCycle.length]];
			}
		}
		function visibilityChanged() {
			stop();
			schedule(SETTINGS.firstPass);
		}
		document.addEventListener('visibilitychange', visibilityChanged);
		schedule(SETTINGS.firstPass);
		return () => {
			stop();
			document.removeEventListener('visibilitychange', visibilityChanged);
		};
	});

	onDestroy(() => {
		for (const frame of frames) frame.destroy(false);
	});
</script>
