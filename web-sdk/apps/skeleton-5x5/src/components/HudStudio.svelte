<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { stateBet, stateBetDerived, stateConfig, stateModal, stateSound } from 'state-shared';
	import { OnHotkey } from 'components-shared';
	import { numberToCurrencyString } from 'utils-shared/amount';
	import { getContext } from '../game/context';
	import { golfAssetUrl } from '../game/golfAssets';
	import MascotGolfer from './MascotGolfer.svelte';

	const context = getContext();

	let stopDisabled = $state(false);

	const isIdle = $derived(context.stateXstateDerived.isIdle());
	const canAffordBet = $derived(stateBetDerived.isBetCostAvailable());
	const hasAutoSpin = $derived(stateBetDerived.hasAutoBetCounter());
	const isTurbo = $derived(stateBet.isTurbo);
	const isMuted = $derived(stateSound.volumeValueMaster === 0);

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

	const biggestBet = $derived(stateConfig.betAmountOptions[stateConfig.betAmountOptions.length - 1]);
	const smallestBet = $derived(stateConfig.betAmountOptions[0]);

	const canIncrease = $derived(isIdle && stateBet.betAmount < biggestBet);
	const canDecrease = $derived(isIdle && stateBet.betAmount > smallestBet);

	const spinOrStop = () => {
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

	const toggleSound = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateSound.volumeValueMaster = stateSound.volumeValueMaster === 0 ? 50 : 0;
	};

	context.eventEmitter.subscribeOnMount({
		stopButtonClick: () => (stopDisabled = true),
		stopButtonEnable: () => (stopDisabled = false),
	});
</script>

<OnHotkey hotkey="Space" disabled={isIdle && !canAffordBet} onpress={spinOrStop} />

<!-- Cartoon Golfer Mascot on Fairway Flank (Desktop only) -->
<MascotGolfer />

<div class="studio-top-bar">
	<div class="logo-badge-wrap">
		<img class="golf-logo" src={golfAssetUrl('logo')} alt="Birdie Breakout" decoding="async" />
		<div class="logo-subline">
			<span class="subline-badge">96.00% RTP</span>
			<span class="subline-tag">WINCAP 100 000X</span>
		</div>
	</div>

	<div class="top-studio">
		<span class="studio-tag">STAKE ENGINE</span>
	</div>
</div>

<!-- Dedicated Stake / Hacksaw Style BUY BONUS / BOOSTER side button -->
{#if context.stateGame.gameType === 'basegame'}
	<div class="side-bonus-container" class:booster-on={isBoosterActive}>
		<button class="side-bonus-btn" onclick={openBuyBonus} title="Menu Achat de Bonus / Booster">
			<!-- Golf Trophy / Cart Icon -->
			<div class="bonus-icon-badge">
				{#if isBoosterActive}
					<!-- Caddie / Golf Cart Icon -->
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="11" width="18" height="7" rx="2" />
						<path d="M6 11 L10 5 L17 5 L19 11" />
						<circle cx="7" cy="18" r="2.5" />
						<circle cx="17" cy="18" r="2.5" />
					</svg>
				{:else}
					<!-- Golden Trophy Icon -->
					<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
						<path d="M6 2H18V5C18 8.31 15.31 11 12 11C8.69 11 6 8.31 6 5V2ZM4 4C4 6.76 6.24 9 9 9V7C7.34 7 6 5.66 6 4H4ZM20 4H18C18 5.66 16.66 7 15 7V9C17.76 9 20 6.76 20 4ZM10 13.9C7.03 14.47 5 17.06 5 20.19V22H19V20.19C19 17.06 16.97 14.47 14 13.9V13C14.7 12.65 15.34 12.18 15.88 11.62C14.74 12.47 13.42 13 12 13C10.58 13 9.26 12.47 8.12 11.62C8.66 12.18 9.3 12.65 10 13V13.9Z"/>
					</svg>
				{/if}
			</div>

			<div class="bonus-text-wrap">
				<span class="bonus-tag">{isBoosterActive ? 'ACTIVE' : 'BONUS'}</span>
				<span class="bonus-title">{isBoosterActive ? 'CADDIE BOOST' : 'BUY BONUS'}</span>
				<span class="bonus-subtitle">{isBoosterActive ? 'DESACTIVER 3X' : '100X MISE'}</span>
			</div>
		</button>
	</div>
{/if}

<!-- Studio Obsidian Golf Bottom HUD Bar -->
<div class="studio-hud-bar">
	<!-- Left Section: Navigation / Rules & Sound -->
	<div class="hud-left">
		<button class="hud-icon-btn" onclick={openPayTable} title="Règles & Table des Gains" aria-label="Règles et table des gains">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="16" x2="12" y2="12" />
				<line x1="12" y1="8" x2="12.01" y2="8" />
			</svg>
		</button>
		<button class="hud-icon-btn" onclick={toggleSound} title={isMuted ? 'Activer le son' : 'Couper le son'}>
			{#if isMuted}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
					<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
					<line x1="23" y1="9" x2="17" y2="15" />
					<line x1="17" y1="9" x2="23" y2="15" />
				</svg>
			{:else}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
					<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
					<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
				</svg>
			{/if}
		</button>
	</div>

	<!-- Center-Left Section: Balance & Win Meters -->
	<div class="hud-meters">
		<div class="meter-box">
			<span class="meter-label">SOLDE</span>
			<span class="meter-val">{balanceDisplay}</span>
		</div>
		<div class="meter-box" class:has-win={hasWin}>
			<span class="meter-label">GAIN</span>
			<span class="meter-val win-val">{winDisplay}</span>
		</div>
	</div>

	<!-- Right Section: Bet Controls, Turbo, Spin & Autoplay -->
	<div class="hud-actions">
		<!-- Bet Selector -->
		<div class="bet-selector">
			<button class="bet-step-btn" disabled={!canDecrease} onclick={decreaseBet} title="Diminuer la mise">−</button>
			<button class="bet-val-btn" onclick={() => (stateModal.modal = { name: 'betAmountMenu' })} title="Choisir la mise">
				<span class="bet-label">MISE</span>
				<span class="bet-number">{betDisplay}</span>
			</button>
			<button class="bet-step-btn" disabled={!canIncrease} onclick={increaseBet} title="Augmenter la mise">+</button>
		</div>

		<!-- Turbo Toggle Button -->
		<button class="hud-mode-btn" class:active={isTurbo} onclick={toggleTurbo} title={isTurbo ? 'Mode Turbo Actif' : 'Activer le mode Turbo'}>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
				<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
			</svg>
			<span class="mode-text">TURBO</span>
		</button>

		<!-- Autoplay Button -->
		<button class="hud-mode-btn" class:active={hasAutoSpin} onclick={toggleAutoSpin} title={hasAutoSpin ? 'Arrêter les tours automatiques' : 'Tours Automatiques'}>
			{#if hasAutoSpin}
				<span class="auto-count">{stateBet.autoSpinsCounter}</span>
				<span class="mode-text">STOP</span>
			{:else}
				<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="23 4 23 10 17 10" />
					<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
				</svg>
				<span class="mode-text">AUTO</span>
			{/if}
		</button>

		<!-- Proeminent Circular SPIN Button (Dimpled Golf Championship Design) -->
		<button
			class="spin-circle-btn"
			class:stopping={!isIdle}
			class:disabled={isIdle && !canAffordBet}
			disabled={isIdle && !canAffordBet}
			onclick={spinOrStop}
			title={isIdle ? 'Lancer un tour (Espace)' : 'Stopper le tour'}
		>
			<div class="spin-ring"></div>
			{#if isIdle}
				<svg class="spin-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="23 4 23 10 17 10" />
					<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
				</svg>
			{:else}
				<div class="stop-icon"></div>
			{/if}
		</button>
	</div>
</div>

<style lang="scss">
	/* Side BUY BONUS / CADDIE BOOSTER Button */
	.side-bonus-container {
		position: fixed;
		left: 24px;
		top: min(36%, max(186px, calc(100% - 484px)));
		transform: translateY(-50%);
		z-index: 60;

		@media (max-width: 1140px) {
			left: 12px;
			top: auto;
			bottom: 84px;
			transform: none;
		}
	}

	.side-bonus-btn {
		width: 126px;
		height: 92px;
		background: linear-gradient(145deg, #182619 0%, #0d1512 100%);
		border: 2px solid #22c55e;
		border-radius: 16px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7), 0 0 18px rgba(34, 197, 94, 0.35);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		color: #ffffff;

		&:hover {
			transform: scale(1.05);
			border-color: #4ade80;
			box-shadow: 0 8px 30px rgba(34, 197, 94, 0.65);
		}

		&:active {
			transform: scale(0.96);
		}

		@media (max-width: 1140px) {
			width: auto;
			height: 42px;
			padding: 0 14px;
			flex-direction: row;
			gap: 8px;
			border-radius: 20px;
		}
	}

	.bonus-icon-badge {
		color: #facc15;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
	}

	.side-bonus-container.booster-on .side-bonus-btn {
		background: linear-gradient(145deg, #072619 0%, #061f14 100%);
		border-color: #00ff88;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 255, 136, 0.5);
	}

	.side-bonus-container.booster-on .bonus-icon-badge {
		color: #00ff88;
	}

	.bonus-text-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.bonus-tag {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 8.5px;
		font-weight: 900;
		letter-spacing: 1.2px;
		color: #052213;
		background: #facc15;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.side-bonus-container.booster-on .bonus-tag {
		background: #00ff88;
		color: #042211;
	}

	.bonus-title {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 12.5px;
		font-weight: 900;
		color: #ffffff;
		letter-spacing: 0.8px;
	}

	.bonus-subtitle {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 10px;
		font-weight: 800;
		color: #86efac;
		letter-spacing: 0.5px;
	}

	.side-bonus-container.booster-on .bonus-subtitle {
		color: #69f0ae;
	}

	/* Studio Obsidian Golf Bottom Bar */
	.studio-hud-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 72px;
		background: linear-gradient(180deg, rgba(13, 21, 18, 0.98) 0%, rgba(6, 12, 10, 1) 100%);
		border-top: 1.5px solid #1a3d2b;
		box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.8), 0 -1px 8px rgba(34, 197, 94, 0.15);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20px;
		z-index: 55;
		color: #ffffff;
		font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		user-select: none;

		@media (max-width: 768px) {
			height: 64px;
			padding: 0 10px;
		}
	}

	.hud-left {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.hud-icon-btn {
		width: 38px;
		height: 38px;
		border-radius: 10px;
		background: #102118;
		border: 1px solid #1c4430;
		color: #86efac;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.15s ease;

		&:hover {
			background: #173827;
			color: #ffffff;
			border-color: #22c55e;
		}

		&:active {
			transform: scale(0.95);
		}
	}

	/* Balance & Win Encarts */
	.hud-meters {
		display: flex;
		align-items: center;
		gap: 12px;

		@media (max-width: 600px) {
			gap: 6px;
		}
	}

	.meter-box {
		background: rgba(13, 29, 21, 0.85);
		border: 1px solid #19432d;
		border-radius: 10px;
		padding: 5px 14px;
		display: flex;
		flex-direction: column;
		min-width: 100px;

		@media (max-width: 600px) {
			padding: 4px 8px;
			min-width: 80px;
		}

		&.has-win {
			border-color: #facc15;
			background: rgba(250, 204, 21, 0.1);
			box-shadow: 0 0 12px rgba(250, 204, 21, 0.25);
		}
	}

	.meter-label {
		font-size: 9.5px;
		font-weight: 700;
		color: #86efac;
		letter-spacing: 1px;
	}

	.meter-val {
		font-size: 14.5px;
		font-weight: 800;
		color: #ffffff;
		font-variant-numeric: tabular-nums;

		@media (max-width: 600px) {
			font-size: 13px;
		}
	}

	.win-val {
		color: #facc15;
		text-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
	}

	/* Action Block */
	.hud-actions {
		display: flex;
		align-items: center;
		gap: 10px;

		@media (max-width: 768px) {
			gap: 6px;
		}
	}

	.bet-selector {
		display: flex;
		align-items: center;
		background: rgba(13, 29, 21, 0.85);
		border: 1px solid #19432d;
		border-radius: 10px;
		padding: 2px;
	}

	.bet-step-btn {
		width: 32px;
		height: 34px;
		border-radius: 8px;
		background: transparent;
		border: none;
		color: #86efac;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;

		&:hover:not(:disabled) {
			background: #173827;
			color: #ffffff;
		}

		&:disabled {
			opacity: 0.3;
			cursor: not-allowed;
		}
	}

	.bet-val-btn {
		background: transparent;
		border: none;
		padding: 2px 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		min-width: 70px;
	}

	.bet-label {
		font-size: 9px;
		font-weight: 700;
		color: #86efac;
		letter-spacing: 1px;
	}

	.bet-number {
		font-size: 14px;
		font-weight: 800;
		color: #ffffff;
		font-variant-numeric: tabular-nums;
	}

	.hud-mode-btn {
		height: 38px;
		padding: 0 10px;
		border-radius: 10px;
		background: #102118;
		border: 1px solid #1c4430;
		color: #86efac;
		display: flex;
		align-items: center;
		gap: 5px;
		cursor: pointer;
		transition: all 0.15s ease;

		&:hover {
			border-color: #22c55e;
			color: #ffffff;
		}

		&.active {
			background: rgba(250, 204, 21, 0.2);
			border-color: #facc15;
			color: #facc15;
			box-shadow: 0 0 14px rgba(250, 204, 21, 0.4);
		}

		@media (max-width: 600px) {
			padding: 0 6px;
			.mode-text {
				display: none;
			}
		}
	}

	.mode-text {
		font-size: 10.5px;
		font-weight: 800;
		letter-spacing: 0.8px;
	}

	.auto-count {
		font-size: 12px;
		font-weight: 900;
		color: #38bdf8;
	}

	/* Proeminent Circular Spin Button (Golf Championship Green & Gold) */
	.spin-circle-btn {
		position: relative;
		width: 58px;
		height: 58px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #22c55e, #15803d);
		border: 2.5px solid #86efac;
		color: #052213;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 0 22px rgba(34, 197, 94, 0.5), 0 4px 12px rgba(0, 0, 0, 0.6);
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

		&:hover:not(:disabled) {
			transform: scale(1.06);
			box-shadow: 0 0 28px rgba(34, 197, 94, 0.8), 0 6px 16px rgba(0, 0, 0, 0.7);
			border-color: #bbf7d0;
		}

		&:active:not(:disabled) {
			transform: scale(0.95);
		}

		&.stopping {
			background: radial-gradient(circle at 35% 35%, #ef4444, #b91c1c);
			border-color: #fca5a5;
			color: #ffffff;
			box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
		}

		&.disabled {
			background: #17261e;
			border-color: #294435;
			color: #4b6656;
			box-shadow: none;
			cursor: not-allowed;
		}

		@media (max-width: 600px) {
			width: 50px;
			height: 50px;
		}
	}

	.spin-icon {
		stroke: #052213;
	}

	.stop-icon {
		width: 18px;
		height: 18px;
		background: #ffffff;
		border-radius: 4px;
	}

	/* Top Bar */
	.studio-top-bar {
		position: fixed;
		top: 14px;
		left: 20px;
		right: 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		pointer-events: none;
		z-index: 50;
		user-select: none;

		@media (max-width: 600px) {
			top: 8px;
			left: 10px;
			right: 10px;
		}
	}

	.logo-badge-wrap {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
		background: rgba(13, 26, 19, 0.96);
		border: 1.5px solid #1e4d35;
		border-radius: 16px;
		padding: 4px 10px 4px 6px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);

		@media (max-width: 400px) {
			gap: 6px;
			padding-inline: 6px;
		}
	}

	.golf-logo {
		display: block;
		width: clamp(95px, 16.8vw, 157px);
		min-width: 0;
		height: auto;
	}

	.logo-subline {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		align-items: flex-start;
		gap: 4px;
		white-space: nowrap;
	}

	.subline-badge {
		background: #14532d;
		color: #86efac;
		font-size: 8.5px;
		font-weight: 800;
		letter-spacing: 1px;
		padding: 1px 5px;
		border-radius: 4px;
	}

	.subline-tag {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 9.5px;
		font-weight: 800;
		color: #facc15;
		letter-spacing: 1.2px;

		@media (max-width: 400px) {
			font-size: 8.5px;
			letter-spacing: 0.7px;
		}
	}

	.top-studio {
		flex-shrink: 0;
		white-space: nowrap;
		background: rgba(13, 26, 19, 0.85);
		border: 1px solid #1e4d35;
		border-radius: 10px;
		padding: 6px 12px;

		@media (max-width: 400px) {
			padding-inline: 7px;
		}
	}

	.studio-tag {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 11px;
		font-weight: 800;
		color: #86efac;
		letter-spacing: 2px;

		@media (max-width: 400px) {
			font-size: 9px;
			letter-spacing: 0.8px;
		}
	}

	@media (max-width: 600px) and (orientation: portrait), (max-height: 500px) and (orientation: landscape) {
		.studio-hud-bar {
			box-sizing: content-box;
			padding-left: max(8px, env(safe-area-inset-left));
			padding-right: max(8px, env(safe-area-inset-right));
			padding-bottom: env(safe-area-inset-bottom);
			touch-action: manipulation;
		}

		.studio-top-bar {
			top: max(8px, env(safe-area-inset-top));
			left: max(10px, env(safe-area-inset-left));
			right: max(10px, env(safe-area-inset-right));
		}

		.side-bonus-container {
			left: max(12px, env(safe-area-inset-left));
		}

		.side-bonus-btn {
			height: 44px;
		}

		.bonus-tag {
			display: none;
		}

		.hud-left,
		.hud-meters {
			gap: 4px;
		}

		.hud-actions {
			flex-shrink: 0;
			gap: 4px;
		}

		.hud-icon-btn,
		.hud-mode-btn,
		.bet-step-btn {
			width: 44px;
			height: 44px;
			padding: 0;
			justify-content: center;
		}

		.bet-val-btn {
			min-width: 52px;
			min-height: 44px;
			padding: 2px 4px;
			justify-content: center;
		}

		.meter-box {
			flex: 1 1 0;
			min-width: 0;
			padding: 4px 6px;
		}

		.meter-val {
			font-size: 13px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.golf-logo {
			width: 88px;
		}
	}

	@media (max-width: 600px) and (orientation: portrait) {
		.studio-hud-bar {
			display: grid;
			grid-template-columns: auto minmax(0, 1fr);
			grid-template-areas: 'tools meters' 'actions actions';
			gap: 4px 8px;
			height: auto;
			padding-top: 5px;
			padding-bottom: calc(5px + env(safe-area-inset-bottom));
		}

		.hud-left {
			grid-area: tools;
		}

		.hud-meters {
			grid-area: meters;
		}

		.hud-actions {
			grid-area: actions;
			justify-content: space-between;
		}

		.side-bonus-container {
			bottom: calc(118px + env(safe-area-inset-bottom));
		}
	}

	@media (max-height: 500px) and (orientation: landscape) {
		.studio-hud-bar {
			height: 52px;
			gap: 6px;
		}

		.hud-meters {
			flex: 0 1 235px;
			min-width: 0;
		}

		.meter-box {
			flex-basis: auto;
			padding-inline: 4px;
		}

		.meter-val {
			font-size: 12px;
		}

		.hud-mode-btn .mode-text {
			display: none;
		}

		.spin-circle-btn {
			width: 50px;
			height: 50px;
		}

		.side-bonus-container {
			bottom: calc(60px + env(safe-area-inset-bottom));
		}

		.logo-badge-wrap {
			gap: 6px;
			padding: 3px 8px 3px 6px;
		}

		.golf-logo {
			width: 54px;
		}

		.subline-tag {
			font-size: 8.5px;
			letter-spacing: 0.7px;
		}
	}
</style>
