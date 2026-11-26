<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { stateBet, stateBetDerived, stateConfig, stateModal, stateSound } from 'state-shared';
	import { OnHotkey } from 'components-shared';
	import { numberToCurrencyString } from 'utils-shared/amount';
	import { getContext } from '../game/context';
	import { branding } from '../game/branding';
	import { golfAssetUrl } from '../game/golfAssets';
	import SpinDirection from './SpinDirection.svelte';

	const context = getContext();

	const { championship, presentation }: { championship: boolean; presentation: boolean } = $props();
	let stopDisabled = $state(false);

	const isIdle = $derived(context.stateXstateDerived.isIdle());
	const reelsMoving = $derived(
		context.stateGame.board.some((reel) => reel.reelState.motion !== 'stopped') ||
			context.stateGame.tumbleBoardAdding.some((reel) =>
				reel.some((symbol) => symbol.symbolY.current !== symbol.symbolY.target),
			) ||
			context.stateGame.tumbleBoardBase.some((reel) =>
				reel.some((symbol) => symbol.symbolY.current !== symbol.symbolY.target),
			),
	);
	const canAffordBet = $derived(stateBetDerived.isBetCostAvailable());
	const hasAutoSpin = $derived(stateBetDerived.hasAutoBetCounter());
	const isTurbo = $derived(stateBet.isTurbo);
	const soundOn = $derived(stateSound.volumeValueMaster > 0);
	let lastSoundVolume = 50;

	const activeMode = $derived(stateBetDerived.activeBetMode());
	const isBoosterActive = $derived(activeMode?.type === 'activate');

	const betCostMultiplier = $derived(activeMode?.costMultiplier ?? 1.0);
	const effectiveBetAmount = $derived(stateBet.betAmount * betCostMultiplier);

	// Win amount calculation from official SDK property stateBet.winBookEventAmount
	const safeWinRaw = $derived(Number(stateBet.winBookEventAmount) || 0);
	const safeWager = $derived(Number(stateBet.wageredBetAmount) || Number(stateBet.betAmount) || 1);
	const targetWinAmount = $derived((safeWinRaw / 100) * safeWager);

	const winTween = new Tween(0);

	$effect(() => {
		const target = Number(targetWinAmount) || 0;
		if (target === 0) {
			winTween.set(0, { duration: 0 });
		} else {
			winTween.set(target, { duration: isTurbo ? 220 : 450, easing: cubicOut });
		}
	});

	const safeWinAnimated = $derived(Number(winTween.current) || 0);
	const winDisplay = $derived(numberToCurrencyString(safeWinAnimated));
	const hasWin = $derived(safeWinRaw > 0);

	const safeBalance = $derived(Number(stateBet.balanceAmount) || 0);
	const balanceDisplay = $derived(numberToCurrencyString(safeBalance));

	const safeEffectiveBet = $derived(Number(effectiveBetAmount) || 0);
	const betDisplay = $derived(numberToCurrencyString(safeEffectiveBet));

	const biggestBet = $derived(
		stateConfig.betAmountOptions[stateConfig.betAmountOptions.length - 1],
	);
	const smallestBet = $derived(stateConfig.betAmountOptions[0]);

	const canIncrease = $derived(isIdle && stateBet.betAmount < biggestBet);
	const canDecrease = $derived(isIdle && stateBet.betAmount > smallestBet);

	const spinOrStop = () => {
		if (presentation) return;
		context.eventEmitter.broadcast({ type: 'soundPressBet' });

		if (isIdle) {
			if (!canAffordBet) return;
			if (activeMode?.type === 'buy') {
				stateBet.activeBetModeKey = 'base';
			}
			context.eventEmitter.broadcast({ type: 'bet' });
		} else {
			if (!stopDisabled) {
				if (hasAutoSpin) stateBet.autoSpinsCounter = 0;
				context.eventEmitter.broadcast({ type: 'stopButtonClick' });
			}
		}
	};

	const toggleTurbo = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateBetDerived.updateIsTurbo(!stateBet.isTurbo, { persistent: true });
	};

	const toggleAutoSpin = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		if (hasAutoSpin) {
			stateBet.autoSpinsCounter = 0;
		} else {
			stateModal.modal = { name: 'autoSpin' };
		}
	};

	const increaseBet = () => {
		if (!canIncrease) return;
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		const nextBigger = [...stateConfig.betAmountOptions]
			.sort((a, b) => a - b)
			.find((opt) => opt > stateBet.betAmount);
		stateBetDerived.setBetAmount(nextBigger || biggestBet);
	};

	const decreaseBet = () => {
		if (!canDecrease) return;
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		const nextSmaller = [...stateConfig.betAmountOptions]
			.sort((a, b) => b - a)
			.find((opt) => opt < stateBet.betAmount);
		stateBetDerived.setBetAmount(nextSmaller || smallestBet);
	};

	const openPayTable = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'payTable' };
	};

	const openBuyBonus = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		if (isBoosterActive) {
			stateBet.activeBetModeKey = 'base';
		} else {
			stateModal.modal = { name: 'buyBonus' };
		}
	};

	const openSettings = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'settings' };
	};

	const toggleSound = () => {
		if (soundOn) {
			lastSoundVolume = stateSound.volumeValueMaster;
			stateSound.volumeValueMaster = 0;
		} else {
			stateSound.volumeValueMaster = lastSoundVolume;
			context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		}
	};

	context.eventEmitter.subscribeOnMount({
		stopButtonClick: () => (stopDisabled = true),
		stopButtonEnable: () => (stopDisabled = false),
	});
</script>

<OnHotkey
	hotkey="Space"
	disabled={presentation || (isIdle && !canAffordBet)}
	onpress={spinOrStop}
/>
<header class="studio-top-bar" class:championship>
	<div class="studio-brand">
		<img src={branding.logo} class="golf-logo" alt={branding.title} draggable="false" />
		<div class="logo-subline"><span>96.00% RTP</span><span>MAX WIN ×100,000</span></div>
	</div>
	{#if !championship}
		<div class="side-bonus-container" inert={presentation}>
			<button class="side-bonus-btn" onclick={openBuyBonus}>
				<strong>{isBoosterActive ? 'CADDIE BOOST' : 'BUY BONUS'}</strong>
				<small>{isBoosterActive ? 'TURN OFF ×3' : '100× BET'}</small>
			</button>
		</div>
	{/if}
</header>

<div class="studio-hud-bar" class:championship inert={presentation}>
	<div class="hud-west">
		<div class="hud-left">
			<button class="hud-icon-btn menu-btn" onclick={openSettings} aria-label="Menu and settings"
				>MENU</button
			>
			<button
				class="hud-icon-btn info-btn"
				onclick={openPayTable}
				aria-label="Information and paytable">INFO</button
			>
		</div>
		<div class="hud-meters">
			<div class="meter-box">
				<small>BALANCE</small><span
					class="meter-val"
					style:--digits={balanceDisplay.length}
					title={balanceDisplay}>{balanceDisplay}</span
				>
			</div>
			<div class="meter-box" class:has-win={hasWin}>
				<small>WIN</small><span
					class="meter-val win-val"
					style:--digits={winDisplay.length}
					title={winDisplay}>{winDisplay}</span
				>
			</div>
		</div>
	</div>

	<button
		class="spin-circle-btn"
		disabled={isIdle ? !canAffordBet : stopDisabled}
		onclick={spinOrStop}
		aria-label={isIdle ? 'Spin' : 'Stop spin'}
		title={isIdle ? 'Spin (Space)' : 'Stop spin'}
	>
		<img class="spin-sphere" src={golfAssetUrl('golf-ball')} alt="" draggable="false" />
		<SpinDirection active={!presentation && !isIdle && reelsMoving} />
		<span class="spin-label" aria-hidden="true">{isIdle ? 'SPIN' : 'STOP'}</span>
	</button>

	<div class="hud-east">
		<div class="bet-selector">
			<button
				class="bet-step-btn"
				disabled={!canDecrease}
				onclick={decreaseBet}
				aria-label="Decrease bet">−</button
			>
			<button
				class="bet-val-btn"
				onclick={() => (stateModal.modal = { name: 'betAmountMenu' })}
				aria-label="Choose bet"
			>
				<small>{betCostMultiplier === 1 ? 'BET' : 'TOTAL BET'}</small><strong>{betDisplay}</strong>
			</button>
			<button
				class="bet-step-btn"
				disabled={!canIncrease}
				onclick={increaseBet}
				aria-label="Increase bet">+</button
			>
		</div>
		<div class="hud-modes">
			<button
				class="hud-mode-btn"
				class:active={isTurbo}
				onclick={toggleTurbo}
				aria-pressed={isTurbo}
				aria-label="Turbo">TURBO</button
			>
			<button
				class="hud-mode-btn"
				class:active={hasAutoSpin}
				onclick={toggleAutoSpin}
				aria-pressed={hasAutoSpin}
				aria-label={hasAutoSpin ? 'Stop auto play' : 'Auto play'}
				>{hasAutoSpin ? `STOP ${stateBet.autoSpinsCounter}` : 'AUTO PLAY'}</button
			>
		</div>
		<button
			class="hud-mode-btn sound-btn"
			class:muted={!soundOn}
			onclick={toggleSound}
			aria-pressed={soundOn}
			aria-label="Sound"
			title={soundOn ? 'Mute sound' : 'Unmute sound'}
		>
			SOUND<small class="sound-state">{soundOn ? 'ON' : 'OFF'}</small>
		</button>
	</div>
</div>

<style>
	.studio-hud-bar,
	.studio-top-bar {
		--hud-cream: #fff9eb;
		--hud-gold: #f6cf73;
		--hud-line: #b99446;
		color: var(--hud-cream);
		font-family: system-ui, sans-serif;
		font-weight: 750;
		user-select: none;
	}

	button {
		font: inherit;
		color: inherit;
		cursor: pointer;
		touch-action: manipulation;
	}

	button:focus-visible {
		outline: 2px solid var(--hud-cream);
		outline-offset: 3px;
	}

	button:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.studio-hud-bar {
		--spin-size: clamp(80px, 6.6vw, 116px);
		--control-height: clamp(46px, 3.5vw, 58px);
		--hud-gap: clamp(6px, 0.74vw, 13px);
		position: fixed;
		inset-inline-start: max(5vw, env(safe-area-inset-left));
		inset-inline-end: max(5vw, env(safe-area-inset-right));
		bottom: calc(var(--practice-browser-inset, 0px) + max(14px, env(safe-area-inset-bottom) + 5px));
		box-sizing: border-box;
		z-index: 55;
		display: grid;
		grid-template-columns: minmax(0, 1fr) var(--spin-size) minmax(0, 1fr);
		gap: var(--hud-gap);
		align-items: center;
		min-height: clamp(76px, 5.5vw, 95px);
		padding: 8px clamp(12px, 1.48vw, 24px);
		border: 3px solid transparent;
		border-radius: clamp(22px, 2.5vw, 43px);
		background:
			linear-gradient(180deg, #32634a, #194832 13%, #123d2b 45%, #0c2e20 84%, #1f4c32) padding-box,
			linear-gradient(180deg, #fff2b0, #dca54f 26%, #895520 56%, #c99542 84%, #f3d174) border-box;
		box-shadow:
			inset 0 0 0 1px #634418,
			inset 0 2px 0 #f9da8430,
			0 2px 5px #02150e71;
	}

	.studio-hud-bar.championship {
		--hud-line: #d1ac60;
		--hud-gold: #ffdf8f;
	}

	.hud-west,
	.hud-east,
	.hud-left,
	.hud-meters,
	.hud-modes {
		display: flex;
		align-items: center;
		min-width: 0;
		gap: var(--hud-gap);
	}

	.hud-left {
		flex: 0 0 auto;
	}

	.hud-meters,
	.hud-modes {
		flex: 1;
	}

	.hud-modes .hud-mode-btn {
		flex: 1 1 0;
	}

	.hud-east {
		justify-content: flex-start;
	}

	.hud-icon-btn,
	.hud-mode-btn,
	.side-bonus-btn {
		box-sizing: border-box;
		border: 1px solid var(--hud-line);
		background: linear-gradient(180deg, #2b583b, #163d28 37%, #11311f);
		box-shadow:
			inset 0 1px #f5d9922b,
			inset 0 -1px #071d13;
	}

	.hud-icon-btn,
	.hud-mode-btn {
		min-width: clamp(44px, 4.4vw, 74px);
		min-height: var(--control-height);
		padding: 0 clamp(6px, 0.65vw, 11px);
		border-radius: 10px;
		font-size: clamp(10px, 0.9vw, 15px);
		white-space: nowrap;
	}

	.hud-mode-btn.active {
		background: linear-gradient(155deg, #6c582b, #46381c);
		border-color: #f3d78a;
	}

	.sound-btn {
		margin-inline-start: auto;
		display: grid;
		align-content: center;
		gap: 2px;
	}

	.sound-state {
		font-size: 9px;
	}

	.sound-btn.muted .sound-state {
		color: #ffebbb;
	}

	.meter-box {
		display: grid;
		align-content: center;
		gap: 2px;
		box-sizing: border-box;
		min-height: var(--control-height);
		min-width: 0;
		flex: 1 1 0;
		padding: 3px clamp(5px, 1vw, 16px);
		border-radius: 9px;
		border: 1px solid #81703e80;
		background: linear-gradient(#092e20, #123a27);
		box-shadow: inset 0 1px 2px #061e15;
		container-type: inline-size;
	}

	.meter-box:first-child {
		flex-grow: 1.22;
	}

	small {
		color: var(--hud-gold);
		font-size: clamp(9px, 0.86vw, 14px);
		line-height: 1.15;
		letter-spacing: 0.045em;
	}

	.meter-val {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 15px;
		font-size: clamp(8px, calc(153cqi / var(--digits)), 23px);
		font-variant-numeric: tabular-nums;
		line-height: 1.13;
	}

	.has-win .win-val {
		color: #ffdfa1;
	}

	.bet-selector {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		gap: clamp(2px, 0.36vw, 6px);
	}

	.bet-val-btn,
	.bet-step-btn {
		border: 0;
		background: transparent;
	}

	.bet-val-btn {
		display: grid;
		align-content: center;
		gap: 2px;
		min-width: clamp(52px, 5vw, 90px);
		min-height: var(--control-height);
		padding: 0 4px;
	}

	.bet-val-btn strong {
		font-size: clamp(12px, 1.3vw, 22px);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.bet-step-btn {
		width: clamp(34px, 3vw, 49px);
		height: clamp(34px, 3vw, 49px);
		padding: 0;
		border: 1px solid #9f8147;
		border-radius: 50%;
		background: linear-gradient(#305e40, #173c28 65%, #10301f);
		box-shadow: inset 0 1px #ffdd9144;
		font-size: clamp(18px, 2vw, 32px);
		line-height: 1;
	}

	.spin-circle-btn {
		position: relative;
		isolation: isolate;
		box-sizing: border-box;
		display: grid;
		place-items: center;
		width: var(--spin-size);
		aspect-ratio: 1;
		margin-block: -17px;
		padding: 0;
		border: 1px solid #684526;
		border-radius: 50%;
		background: linear-gradient(145deg, #fff0b5 10%, #d39c42 42%, #ebc264 72%, #b37b2e);
	}

	.spin-circle-btn::before {
		content: '';
		position: absolute;
		inset: 5%;
		z-index: -1;
		border: 1px solid #74521e;
		border-radius: inherit;
		background: radial-gradient(circle at 40% 29%, #24523d, #082a19 77%);
	}

	.spin-sphere {
		display: block;
		width: 81%;
		height: 81%;
		object-fit: contain;
		pointer-events: none;
	}

	.spin-label {
		position: absolute;
		bottom: 1.5%;
		left: 50%;
		transform: translateX(-50%);
		padding: 0 6px;
		border: 1px solid #c59441;
		border-radius: 5px;
		background: #143b24;
		color: #ffdd81;
		font-size: clamp(8px, 0.78vw, 13px);
		line-height: 1.3;
		letter-spacing: 0.08em;
	}

	.spin-circle-btn:active:not(:disabled) {
		box-shadow: inset 0 0 0 2px #f9e2a3;
	}

	@media (hover: hover) {
		button:hover:not(:disabled) {
			border-color: #ffe1a0;
		}
		.spin-circle-btn:hover:not(:disabled) {
			border-color: #ffe1a0;
		}
	}

	.studio-top-bar {
		position: fixed;
		left: max(clamp(9px, 2.6vw, 50px), env(safe-area-inset-left));
		top: max(12px, env(safe-area-inset-top));
		z-index: 50;
		display: grid;
		justify-items: start;
		gap: clamp(8px, 0.8vw, 10px);
		pointer-events: none;
	}

	.studio-brand {
		display: flex;
		align-items: center;
		gap: clamp(6px, 0.7vw, 13px);
	}

	.golf-logo {
		display: block;
		width: clamp(104px, 11.28vw, 182px);
		height: auto;
	}

	.logo-subline {
		display: grid;
		gap: 5px;
	}

	.logo-subline span {
		padding: 4px 8px;
		border: 1px solid #d7a743;
		border-radius: 100px;
		background: #0e3624;
		font-size: clamp(8px, 0.82vw, 13px);
		line-height: 1.2;
		text-align: center;
		white-space: nowrap;
	}

	.logo-subline span:last-child {
		color: var(--hud-gold);
	}

	.side-bonus-container:not([inert]) {
		pointer-events: auto;
	}

	.side-bonus-btn {
		display: grid;
		align-content: center;
		gap: 3px;
		min-width: clamp(100px, 9.5vw, 174px);
		min-height: clamp(44px, 3.3vw, 48px);
		padding: 5px 13px;
		border-width: 2px;
		border-radius: 13px;
	}

	.side-bonus-btn strong {
		font-size: clamp(12px, 1.28vw, 21px);
		line-height: 1.1;
	}

	@media (max-width: 1080px) {
		.studio-hud-bar {
			--spin-size: 76px;
			inset-inline-start: max(2vw, env(safe-area-inset-left));
			inset-inline-end: max(2vw, env(safe-area-inset-right));
		}
	}

	@media (orientation: landscape) and (max-height: 560px) {
		.studio-hud-bar {
			--spin-size: 57px;
			--control-height: 42px;
			--hud-gap: 4px;
			inset-inline-start: max(6px, env(safe-area-inset-left));
			inset-inline-end: max(6px, env(safe-area-inset-right));
			bottom: calc(var(--practice-browser-inset, 0px) + max(5px, env(safe-area-inset-bottom)));
			grid-template-columns: minmax(0, 0.97fr) var(--spin-size) minmax(0, 1.03fr);
			min-height: 58px;
			padding: 5px 8px;
			border-radius: 22px;
		}

		.hud-icon-btn,
		.hud-mode-btn {
			min-width: 37px;
			padding-inline: 4px;
			border-radius: 8px;
			font-size: 9px;
		}

		.hud-mode-btn {
			white-space: normal;
		}

		.hud-modes .hud-mode-btn {
			width: 41px;
		}

		.bet-selector {
			gap: 2px;
		}

		.bet-step-btn {
			width: 28px;
			height: 38px;
		}

		.bet-val-btn {
			min-width: 48px;
		}

		.meter-box {
			padding-inline: 4px;
		}

		.spin-circle-btn {
			margin-block: -6px;
		}

		.studio-top-bar {
			left: max(7px, env(safe-area-inset-left));
			top: max(6px, env(safe-area-inset-top));
			gap: 4px;
		}

		.golf-logo {
			width: clamp(55px, 10.85vw, 97px);
		}

		.logo-subline {
			gap: 3px;
		}

		.logo-subline span {
			padding: 2px 4px;
			font-size: 7px;
		}

		.side-bonus-btn {
			min-width: 72px;
			min-height: 34px;
			padding: 3px 6px;
			border-width: 1px;
			border-radius: 7px;
		}

		.side-bonus-btn strong,
		.side-bonus-btn small {
			font-size: 8px;
			white-space: nowrap;
		}
	}

	@media (orientation: portrait) and (max-width: 620px) {
		.studio-hud-bar {
			--spin-size: 64px;
			--control-height: 44px;
			--hud-gap: 4px;
			inset-inline-start: max(6px, env(safe-area-inset-left));
			inset-inline-end: max(6px, env(safe-area-inset-right));
			bottom: calc(var(--practice-browser-inset, 0px) + max(6px, env(safe-area-inset-bottom)));
			grid-template-columns: 44px 44px minmax(0, 1.15fr) minmax(0, 1fr) 44px;
			grid-template-areas: 'menu info balance win sound' 'play play play play play';
			padding: 5px 6px;
			border-radius: 18px;
		}
		.hud-west,
		.hud-left,
		.hud-meters,
		.hud-east {
			display: contents;
		}
		.menu-btn {
			grid-area: menu;
		}
		.info-btn {
			grid-area: info;
		}
		.meter-box:first-child {
			grid-area: balance;
		}
		.meter-box:last-child {
			grid-area: win;
		}
		.meter-box {
			padding-inline: 4px;
		}
		.meter-val {
			font-size: clamp(8px, calc(156cqi / var(--digits)), 15px);
		}

		.bet-selector,
		.spin-circle-btn,
		.hud-modes {
			grid-area: play;
		}
		.bet-selector {
			justify-self: start;
			gap: 1px;
		}
		.hud-modes {
			justify-self: end;
		}
		.hud-modes .hud-mode-btn {
			flex: 0 1 auto;
		}
		.hud-icon-btn,
		.hud-mode-btn {
			min-width: 44px;
			padding-inline: 4px;
			border-radius: 8px;
			font-size: 9px;
			white-space: normal;
		}
		.sound-btn {
			grid-area: sound;
			width: 100%;
			margin: 0;
		}
		.bet-step-btn {
			width: clamp(34px, calc((100vw - 251px) / 2), 44px);
			height: 44px;
		}
		.bet-val-btn {
			min-width: clamp(39px, 11vw, 55px);
			padding: 0 1px;
		}
		.bet-val-btn strong {
			font-size: clamp(10px, 3vw, 14px);
		}
		.spin-circle-btn {
			justify-self: center;
			margin-block: 0;
		}

		.studio-top-bar {
			left: max(7px, env(safe-area-inset-left));
			right: max(7px, env(safe-area-inset-right));
			top: max(6px, env(safe-area-inset-top));
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 5px;
		}
		.golf-logo {
			width: auto;
			height: 54px;
		}
		.logo-subline {
			gap: 3px;
		}
		.logo-subline span {
			padding: 3px 5px;
			font-size: 8px;
		}
		.side-bonus-btn {
			min-width: 79px;
			min-height: 44px;
			padding: 3px 6px;
			border-width: 1px;
			border-radius: 8px;
		}
		.side-bonus-btn strong,
		.side-bonus-btn small {
			font-size: 9px;
		}
	}

	@media (orientation: portrait) and (max-width: 350px) {
		.studio-brand {
			gap: 3px;
		}

		.logo-subline span {
			padding-inline: 4px;
		}

		.studio-hud-bar {
			grid-template-columns: 44px 44px minmax(0, 1.08fr) minmax(0, 1fr);
			grid-template-areas: 'menu info balance win' 'play play play play';
		}

		.sound-btn {
			position: fixed;
			top: calc(max(6px, env(safe-area-inset-top)) + 5px);
			right: calc(max(7px, env(safe-area-inset-right)) + 85px);
			width: 44px;
		}
	}
</style>
