<script lang="ts" module>
	import type { WinLevelData } from '../game/winLevelMap';

	export type BonusCard = 'intro' | 'outro';
	export type EmitterEventRoundPresentation =
		| { type: 'freeSpinIntroShow' }
		| { type: 'freeSpinIntroHide' }
		| { type: 'freeSpinIntroUpdate'; totalFreeSpins: number }
		| { type: 'freeSpinOutroShow' }
		| { type: 'freeSpinOutroHide' }
		| { type: 'freeSpinOutroCountUp'; amount: number; winLevelData: WinLevelData }
		| { type: 'winShow' }
		| { type: 'winHide' }
		| { type: 'winUpdate'; amount: number; winLevelData: WinLevelData };
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { getContext } from '../game/context';
	import { isCelebrationWin } from '../game/studioVisuals';
	import TournamentCard from './TournamentCard.svelte';
	import WinCelebration from './WinCelebration.svelte';

	type Props = { bonusCard?: BonusCard; winVisible?: boolean };
	type Card =
		| { kind: BonusCard; amount: number }
		| { kind: 'win'; amount: number; winLevelData: WinLevelData };
	type Request = Card & { resolve: () => void };
	let { bonusCard = $bindable(), winVisible = $bindable(false) }: Props = $props();
	const { eventEmitter } = getContext();
	let pending: Request | undefined = $state.raw();

	function dismiss(request = pending) {
		if (!request || request !== pending) return;
		pending = undefined;
		winVisible = false;
		request.resolve();
	}

	function present(card: Card) {
		dismiss();
		return new Promise<void>((resolve) => {
			pending = { ...card, resolve };
			winVisible = card.kind === 'win';
		});
	}

	function enterBonusCard(kind: BonusCard) {
		if (bonusCard === kind) return;
		dismiss();
		bonusCard = kind;
	}

	function leaveBonusCard(kind: BonusCard) {
		if (bonusCard !== kind) return;
		if (pending?.kind === kind) dismiss();
		bonusCard = undefined;
	}

	eventEmitter.subscribeOnMount({
		freeSpinIntroShow: () => enterBonusCard('intro'),
		freeSpinIntroUpdate: ({ totalFreeSpins }) => present({ kind: 'intro', amount: totalFreeSpins }),
		freeSpinIntroHide: () => leaveBonusCard('intro'),
		freeSpinOutroShow: () => enterBonusCard('outro'),
		freeSpinOutroCountUp: ({ amount }) => present({ kind: 'outro', amount }),
		freeSpinOutroHide: () => leaveBonusCard('outro'),
		winUpdate: ({ amount, winLevelData }) => {
			if (!bonusCard && isCelebrationWin(amount))
				return present({ kind: 'win', amount, winLevelData });
		},
		winHide: () => {
			if (pending?.kind === 'win') dismiss();
		},
	});

	onDestroy(() => dismiss());
</script>

{#each pending ? [pending] : [] as card (card)}
	{#if card.kind === 'win'}
		<WinCelebration
			amount={card.amount}
			winLevelData={card.winLevelData}
			oncomplete={() => dismiss(card)}
		/>
	{:else}
		<TournamentCard
			type={card.kind === 'intro' ? 'intro' : 'result'}
			amount={card.amount}
			oncomplete={() => dismiss(card)}
		/>
	{/if}
{/each}
