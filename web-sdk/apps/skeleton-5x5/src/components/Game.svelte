<script lang="ts">
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { MediaQuery } from 'svelte/reactivity';

	import { EnablePixiExtension } from 'components-pixi';
	import { EnableHotkey } from 'components-shared';
	import { MainContainer } from 'components-layout';
	import { App } from 'pixi-svelte';
	import { stateModal } from 'state-shared';

	import { GameVersion, Modals } from 'components-ui-html';

	import { getContext } from '../game/context';
	import { getPracticeLighting } from '../game/practiceLighting';
	import EnableSound from './EnableSound.svelte';
	import EnableGameActor from './EnableGameActor.svelte';
	import ResumeBet from './ResumeBet.svelte';
	import Sound from './Sound.svelte';
	import Background from './Background.svelte';
	import PracticeStage from './PracticeStage.svelte';
	import LoadingScreen from './LoadingScreen.svelte';
	import BoardFrame from './BoardFrame.svelte';
	import MultiplierGrid from './MultiplierGrid.svelte';
	import Board from './Board.svelte';
	import Anticipations from './Anticipations.svelte';
	import ClusterWinAmounts from './ClusterWinAmounts.svelte';
	import TumbleBoard from './TumbleBoard.svelte';
	import TumbleWinAmount from './TumbleWinAmount.svelte';
	import BonusMarquee from './BonusMarquee.svelte';
	import RoundPresentation, { type BonusCard } from './RoundPresentation.svelte';
	import Transition from './Transition.svelte';
	import PaytableContent from './PaytableContent.svelte';
	import HudStudio from './HudStudio.svelte';

	const context = getContext();
	let bonusCard = $state<BonusCard>();
	let winVisible = $state(false);
	const freeSpins = $derived(context.stateGame.gameType === 'freegame');
	const championship = $derived(freeSpins || bonusCard !== undefined);
	const presenting = $derived(bonusCard !== undefined || winVisible);
	const reduceMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	const sunset = new Tween(0);
	const lighting = $derived(getPracticeLighting(sunset.current));

	$effect(() => {
		void sunset.set(championship ? 1 : 0, {
			duration: reduceMotion.current ? 0 : 420,
			easing: cubicInOut,
		});
	});

	onMount(() => (context.stateLayout.showLoadingScreen = true));

	context.eventEmitter.subscribeOnMount({
		buyBonusConfirm: () => {
			stateModal.modal = { name: 'buyBonusConfirm' };
		},
	});
</script>

<App>
	<EnableSound />
	<EnableHotkey />
	<EnableGameActor />
	<EnablePixiExtension />

	<Background sunset={sunset.current} />
	<Transition />

	{#if context.stateLayout.showLoadingScreen}
		<LoadingScreen onloaded={() => (context.stateLayout.showLoadingScreen = false)} />
	{:else}
		<PracticeStage {lighting} />
		<RoundPresentation bind:bonusCard bind:winVisible />
		<ResumeBet />
		<!--
			The reason why <Sound /> is rendered after clicking the loading screen:
			"Autoplay with sound is allowed if: The user has interacted with the domain (click, tap, etc.)."
			Ref: https://developer.chrome.com/blog/autoplay
		-->
		<Sound />

		<MainContainer>
			<BoardFrame tint={lighting.frame} />
		</MainContainer>

		<MainContainer>
			<MultiplierGrid />
		</MainContainer>

		<MainContainer>
			<Board />
			<Anticipations />
		</MainContainer>

		<MainContainer>
			<TumbleBoard />
			<ClusterWinAmounts />
		</MainContainer>

		<TumbleWinAmount />
		<BonusMarquee visible={freeSpins && !bonusCard} />
	{/if}
</App>

{#if !context.stateLayout.showLoadingScreen}
	<HudStudio {championship} presentation={presenting} />
{/if}

<Modals>
	{#snippet version()}
		<GameVersion version="0.0.0" />
	{/snippet}
	{#snippet paytable()}
		<PaytableContent />
	{/snippet}
	{#snippet gameRules()}
		<PaytableContent />
	{/snippet}
</Modals>

<style>
	:global(:root) {
		--practice-safe-top: env(safe-area-inset-top, 0px);
		--practice-safe-right: env(safe-area-inset-right, 0px);
		--practice-safe-bottom: env(safe-area-inset-bottom, 0px);
		--practice-safe-left: env(safe-area-inset-left, 0px);
	}

	:global(.birdie-breakout canvas) {
		display: block;
	}

	/* Disable the shared SDK modal blur for this game. */
	:global(.birdie-breakout .pop-up-wrap .blur-layer) {
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		background: rgb(14 26 19 / 76%);
	}
</style>
