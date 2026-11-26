<script lang="ts">
	import { onMount } from 'svelte';
	import { OnHotkey } from 'components-shared';
	import { BaseSprite, Container, PIXI } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { studioTexture, warmStudioFont } from '../game/studioVisuals';
	import { prepareSymbolTextures, warmMultiplierLabels } from '../game/symbolTextureCache';
	import ScreenSprite from './ScreenSprite.svelte';
	import StudioText from './StudioText.svelte';

	const { onloaded }: { onloaded: () => void } = $props();
	const context = getContext();
	const sizes = $derived(context.stateLayoutDerived.canvasSizes());
	const assets = $derived(context.stateApp.loadedAssets);
	const width = $derived(Math.min(520, sizes.width * 0.78, sizes.height * 0.86));
	const logo = $derived(studioTexture(assets, 'logo'));
	let ready = $state(false);
	let transitioning = $state(false);
	const enter = async () => {
		if (!ready || transitioning) return;
		transitioning = true;
		await context.eventEmitter.broadcastAsync({ type: 'transition' });
		onloaded();
	};

	onMount(async () => {
		prepareSymbolTextures(assets);
		const labels = warmMultiplierLabels();
		warmStudioFont();
		const textures = Object.values(assets).filter(
			(asset): asset is PIXI.Texture => asset instanceof PIXI.Texture,
		);
		try {
			await context.stateApp.pixiApplication?.renderer.prepare?.upload([...textures, ...labels]);
		} finally {
			ready = true;
		}
	});
</script>

<ScreenSprite
	tint={0x142419}
	alpha={0.44}
	zIndex={100}
	onpress={ready && !transitioning ? enter : undefined}
/>
<Container x={sizes.width * 0.5} y={sizes.height * 0.47} zIndex={101} eventMode="none">
	<BaseSprite texture={logo} anchor={0.5} {width} height={(width * logo.height) / logo.width} />
	<StudioText
		y={width * 0.35}
		text={ready ? 'TAP TO PLAY' : 'LOADING'}
		tint={0xffe994}
		size={Math.min(18, width * 0.056)}
	/>
</Container>
<OnHotkey hotkey="Space" disabled={!ready || transitioning} onpress={enter} />
<OnHotkey hotkey="Enter" disabled={!ready || transitioning} onpress={enter} />
