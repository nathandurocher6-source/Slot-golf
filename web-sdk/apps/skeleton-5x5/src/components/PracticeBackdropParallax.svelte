<script lang="ts">
	import { onMount } from 'svelte';
	import { PIXI, getContextParent } from 'pixi-svelte';

	type Props = {
		day: PIXI.Texture;
		night: PIXI.Texture;
		sunset: number;
		projection: { x: number; y: number; scale: number };
		screenWidth: number;
	};
	const { day, night, sunset, projection, screenWidth }: Props = $props();

	// The scenery is a single painting. Its continuous UVs cross the depth bands
	// without cutout seams. The outer columns stay fixed to cover the whole viewport.
	const columns = [0, 0.08, 0.92, 1];
	const bands = [
		{ y: 0, depth: 1.5 },
		{ y: 0.39, depth: 1.5 },
		{ y: 0.57, depth: 2.8 },
		{ y: 0.7, depth: 3.3 },
		{ y: 0.86, depth: 3.7 },
		{ y: 1, depth: 5.2 },
	];
	const coords = bands.flatMap(({ y }) => columns.flatMap((x) => [x, y]));
	const positions = new Float32Array(coords.length);
	const indices: number[] = [];
	for (let row = 1; row < bands.length; row++) {
		for (let col = 1; col < columns.length; col++) {
			const top = (row - 1) * columns.length + col - 1;
			const bottom = top + columns.length;
			indices.push(top, top + 1, bottom, top + 1, bottom + 1, bottom);
		}
	}
	const geometry = new PIXI.MeshGeometry({
		positions,
		uvs: new Float32Array(coords),
		indices: new Uint32Array(indices),
	});
	const dayMesh = new PIXI.Mesh({ texture: day, geometry, label: 'Day course', zIndex: -8 });
	const nightMesh = new PIXI.Mesh({ texture: night, geometry, label: 'Sunset course', zIndex: -7 });
	const parent = getContextParent();
	parent.addToParent(dayMesh);
	parent.addToParent(nightMesh);

	let shift = $state(0);
	let target = 0;
	let frame = 0;

	function step() {
		const remaining = target - shift;
		if (Math.abs(remaining) < 0.004) {
			shift = target;
			frame = 0;
			return;
		}
		shift += remaining * 0.24;
		frame = requestAnimationFrame(step);
	}

	function move(event: PointerEvent) {
		if (event.pointerType !== 'mouse') return;
		target = Math.max(-1, Math.min(1, 1 - (event.clientX / screenWidth) * 2));
		if (!frame) frame = requestAnimationFrame(step);
	}

	function reset() {
		target = 0;
		if (!frame && shift !== 0) frame = requestAnimationFrame(step);
	}

	onMount(() => {
		document.documentElement.addEventListener('pointerleave', reset);
		return () => {
			document.documentElement.removeEventListener('pointerleave', reset);
			cancelAnimationFrame(frame);
			geometry.destroy();
		};
	});

	$effect(() => {
		const width = day.width * projection.scale;
		const height = day.height * projection.scale;
		const left = projection.x - width / 2;
		const top = projection.y - height / 2;
		const offset = shift;
		for (let row = 0; row < bands.length; row++) {
			const band = bands[row];
			for (let col = 0; col < columns.length; col++) {
				const point = 2 * (row * columns.length + col);
				const pinned = col === 0 || col === columns.length - 1;
				positions[point] = left + columns[col] * width + (pinned ? 0 : offset * band.depth);
				positions[point + 1] = top + band.y * height;
			}
		}
		geometry.getBuffer('aPosition').update();
	});

	$effect(() => {
		dayMesh.visible = sunset < 1;
		nightMesh.visible = sunset > 0;
		nightMesh.alpha = sunset;
	});
</script>

<svelte:window onpointermove={move} onblur={reset} />
