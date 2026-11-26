<script lang="ts">
	import { onDestroy } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { golfAssetUrl } from '../game/golfAssets';

	const { spinning }: { spinning: boolean } = $props();
	const reduceMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	// Atlas dimensions from scripts/render_spin_ball.py.
	const columns = 8;
	const rows = 6;
	const frameCount = columns * rows;
	const cellSize = 176;
	const maxSpeed = 1.05; // revolutions per second
	let atlas: HTMLImageElement | undefined = $state();
	let motion = $state<'idle' | 'accelerating' | 'spinning' | 'slowing'>('idle');
	let running = false;
	let speed = 0;
	let turns = 0;
	let previousTime: number | undefined;
	let animation: number | undefined;
	let frame = 0;

	function stop() {
		if (animation !== undefined) cancelAnimationFrame(animation);
		animation = undefined;
		previousTime = undefined;
		speed = 0;
		motion = 'idle';
	}

	function draw(time: number) {
		animation = undefined;
		const elapsed = Math.min((time - (previousTime ?? time)) / 1000, 0.05);
		previousTime = time;
		const ramp = running ? 0.28 : 0.38;
		const target = running ? maxSpeed : 0;
		const step = (maxSpeed * elapsed) / ramp;
		const nextSpeed = running ? Math.min(target, speed + step) : Math.max(0, speed - step);
		turns = (turns + ((speed + nextSpeed) / 2) * elapsed) % 1;
		speed = nextSpeed;
		const nextFrame = Math.floor(turns * frameCount);
		if (atlas && nextFrame !== frame) {
			frame = nextFrame;
			const x = ((frame % columns) * -100) / columns;
			const y = (Math.floor(frame / columns) * -100) / rows;
			atlas.style.transform = `translate3d(${x}%, ${y}%, 0)`;
		}

		if (running || speed > 0) {
			motion = running ? (speed < maxSpeed ? 'accelerating' : 'spinning') : 'slowing';
			animation = requestAnimationFrame(draw);
		} else {
			stop();
		}
	}

	$effect(() => {
		running = spinning && !reduceMotion.current;
		if (reduceMotion.current) {
			stop();
		} else if (atlas && (running || speed > 0) && animation === undefined) {
			animation = requestAnimationFrame(draw);
		}
	});

	onDestroy(stop);
</script>

<span class="spin-sphere" data-motion={motion} aria-hidden="true">
	<img
		bind:this={atlas}
		src={golfAssetUrl('spin-ball')}
		alt=""
		draggable="false"
		width={columns * cellSize}
		height={rows * cellSize}
		style:width={`${columns * 100}%`}
	/>
</span>

<style>
	.spin-sphere {
		display: block;
		position: relative;
		width: 79%;
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: 50%;
		pointer-events: none;
	}
	img {
		position: absolute;
		inset: 0 auto auto 0;
		display: block;
		height: auto;
		max-width: none;
		transform: translate3d(0, 0, 0);
	}
</style>
