<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';

	const { active }: { active: boolean } = $props();
	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	let arrow: SVGSVGElement;
	let frame = 0;
	let previous = 0;
	let angle = 0;
	let speed = 0;
	let moving = false;

	function tick(now: number) {
		const elapsed = previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60;
		previous = now;
		const target = moving ? 465 : 0;
		speed += (target - speed) * (1 - Math.exp(-elapsed / (moving ? 0.15 : 0.115)));
		angle = (angle + speed * elapsed) % 360;
		arrow.style.rotate = `${angle}deg`;
		if (!moving && speed < 8) {
			speed = 0;
			frame = 0;
			previous = 0;
		} else {
			frame = requestAnimationFrame(tick);
		}
	}

	function sync() {
		if (document.hidden || reducedMotion.current) {
			cancelAnimationFrame(frame);
			frame = previous = speed = 0;
			return;
		}
		if (!frame && moving) frame = requestAnimationFrame(tick);
	}

	$effect(() => {
		moving = active;
		sync();
	});
	$effect(() => {
		document.addEventListener('visibilitychange', sync);
		return () => {
			document.removeEventListener('visibilitychange', sync);
			cancelAnimationFrame(frame);
		};
	});
</script>

<svg bind:this={arrow} class="spin-direction" viewBox="0 0 100 100" fill="none" aria-hidden="true">
	<path d="M31 89 A43 43 0 1 1 92 59 M83 50 L92 60 L99 51" />
</svg>

<style>
	.spin-direction {
		position: absolute;
		inset: 6%;
		width: 88%;
		height: 88%;
		transform-origin: center;
		pointer-events: none;
		overflow: visible;
	}
	path {
		stroke: #295e45;
		stroke-width: 3.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
