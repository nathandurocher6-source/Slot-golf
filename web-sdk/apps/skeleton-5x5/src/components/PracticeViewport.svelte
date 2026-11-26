<script lang="ts">
	import { onMount } from 'svelte';
	import { getContextApp } from 'pixi-svelte';
	import { watchPracticeViewport } from '../game/practiceViewport.svelte';

	const { stateApp } = getContextApp();
	onMount(() => {
		const app = stateApp.pixiApplication;
		if (!app) return;
		app.resizeTo = null;
		return watchPracticeViewport((width, height) => {
			const { renderer } = app;
			if (
				Math.abs(renderer.screen.width - width) > 0.35 ||
				Math.abs(renderer.screen.height - height) > 0.35
			) {
				renderer.resize(width, height);
			}
			app.canvas.style.width = `${width}px`;
			app.canvas.style.height = `${height}px`;
		});
	});
</script>
