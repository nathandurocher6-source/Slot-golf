<script lang="ts" module>
	export type EmitterEventMultiplierGrid =
		| { type: 'multiplierGridShow' }
		| { type: 'multiplierGridHide' }
		| { type: 'multiplierGridUpdate'; grid: number[][] }
		| { type: 'multiplierGridClear' };
</script>

<script lang="ts">
	import { BaseSprite, Container, PIXI } from 'pixi-svelte';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	import StudioText from './StudioText.svelte';

	const context = getContext();
	const DEFAULT_GRID = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
	];

	let show = $state(false);
	let grid = $state(DEFAULT_GRID);

	context.eventEmitter.subscribeOnMount({
		multiplierGridShow: () => (show = true),
		multiplierGridHide: () => (show = false),
		multiplierGridUpdate: (emitterEvent) => (grid = emitterEvent.grid),
		multiplierGridClear: () => (grid = DEFAULT_GRID),
	});
</script>

<BoardContainer>
	{#if show}
		{#each grid as reel, reelIndex}
			{#each reel as multiplier, rowIndex}
				{#if multiplier > 0}
					<Container x={(reelIndex + 0.5) * SYMBOL_SIZE} y={(rowIndex + 0.5) * SYMBOL_SIZE}>
						<BaseSprite
							texture={PIXI.Texture.WHITE}
							tint={0xf0d584}
							alpha={0.27}
							width={SYMBOL_SIZE - 8}
							height={SYMBOL_SIZE - 8}
							anchor={0.5}
						/>
						{#if multiplier > 1}
							<BaseSprite
								texture={PIXI.Texture.WHITE}
								tint={0x183826}
								alpha={0.96}
								y={24}
								width={48}
								height={20}
								anchor={0.5}
							/>
							<StudioText y={24} text={`×${multiplier}`} size={11} tint={0xffe066} />
						{/if}
					</Container>
				{/if}
			{/each}
		{/each}
	{/if}
</BoardContainer>
