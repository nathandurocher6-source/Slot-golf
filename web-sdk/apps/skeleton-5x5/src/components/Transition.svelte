<script lang="ts" module>
	export type EmitterEventTransition = { type: 'transition' };
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import TransitionAnimation from './TransitionAnimation.svelte';
	import { getContext } from '../game/context';

	const { eventEmitter } = getContext();
	let pending: { covered: () => void } | undefined = $state.raw();

	eventEmitter.subscribeOnMount({
		transition: () =>
			new Promise<void>((resolve) => {
				pending?.covered();
				pending = { covered: resolve };
			}),
	});

	onDestroy(() => pending?.covered());
</script>

{#each pending ? [pending] : [] as transition (transition)}
	<TransitionAnimation
		oncovered={transition.covered}
		oncomplete={() => {
			if (transition === pending) pending = undefined;
		}}
	/>
{/each}
