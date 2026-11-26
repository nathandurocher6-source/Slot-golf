<script lang="ts">
	import { onMount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import ScreenSprite from './ScreenSprite.svelte';

	const { oncovered, oncomplete }: { oncovered: () => void; oncomplete: () => void } = $props();
	const reduceMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	const alpha = new Tween(0);

	onMount(() => {
		let alive = true;
		const options = { duration: reduceMotion.current ? 0 : 150, easing: cubicInOut };

		async function play() {
			await alpha.set(0.9, options);
			if (!alive) return;
			oncovered();
			await alpha.set(0, options);
			if (alive) oncomplete();
		}

		void play();
		return () => {
			alive = false;
			void alpha.set(alpha.current, { duration: 0 });
		};
	});
</script>

<ScreenSprite tint={0x17241a} alpha={alpha.current} zIndex={200} />
