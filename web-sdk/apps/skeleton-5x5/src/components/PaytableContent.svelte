<script lang="ts">
	import { stateBet, stateModal } from 'state-shared';
	import { getSymbolImageUrl } from '../game/golfAssets';

	type Tab = 'payouts' | 'features' | 'rules';
	let activeTab = $state<Tab>('payouts');

	const baseBet = $derived(stateBet.betAmount || 1);

	const closeModal = () => {
		stateModal.modal = null;
	};

	// High paying golf symbols
	const highSymbols = [
		{
			id: 'H1',
			name: 'TITANIUM DRIVER',
			subtitle: 'CARBON & BLUE CLUBHEAD',

			color: '#b4d1df',
			bg: '#081c38',
			border: '#00f0ff',
			tiers: [
				{ count: '15+', mult: 150.0 },
				{ count: '11-14', mult: 60.0 },
				{ count: '8-10', mult: 25.0 },
				{ count: '6-7', mult: 12.0 },
				{ count: '5', mult: 5.0 },
			],
		},
		{
			id: 'H2',
			name: 'GOLF CART',
			subtitle: 'BLUE AND WHITE, RED BAG',

			color: '#c3dbc6',
			bg: '#07261a',
			border: '#10b981',
			tiers: [
				{ count: '15+', mult: 100.0 },
				{ count: '11-14', mult: 40.0 },
				{ count: '8-10', mult: 18.0 },
				{ count: '6-7', mult: 8.0 },
				{ count: '5', mult: 3.0 },
			],
		},
		{
			id: 'H3',
			name: 'CHROME IRON',
			subtitle: 'POLISHED STEEL HEAD',

			color: '#f1f5f9',
			bg: '#0f172a',
			border: '#94a3b8',
			tiers: [
				{ count: '15+', mult: 60.0 },
				{ count: '11-14', mult: 25.0 },
				{ count: '8-10', mult: 12.0 },
				{ count: '6-7', mult: 5.0 },
				{ count: '5', mult: 2.0 },
			],
		},
		{
			id: 'H4',
			name: 'GOLF TEES',
			subtitle: 'WOODEN PAIR',

			color: '#dfbf91',
			bg: '#1e0e24',
			border: '#f43f5e',
			tiers: [
				{ count: '15+', mult: 40.0 },
				{ count: '11-14', mult: 18.0 },
				{ count: '8-10', mult: 8.0 },
				{ count: '6-7', mult: 3.5 },
				{ count: '5', mult: 1.5 },
			],
		},
	] as const;

	// Low paying golf symbols (A, K, Q, J, 10 with golf striped fairway interiors)
	const lowSymbols = [
		{
			id: 'L1',
			name: 'ACE (A)',
			subtitle: 'GREEN ACE',
			color: '#fef08a',
			bg: '#1a2412',
			border: '#eab308',
			tiers: [
				{ count: '15+', mult: 20.0 },
				{ count: '11-14', mult: 8.0 },
				{ count: '8-10', mult: 4.0 },
				{ count: '6-7', mult: 2.0 },
				{ count: '5', mult: 0.8 },
			],
		},
		{
			id: 'L2',
			name: 'KING (K)',
			subtitle: 'FAIRWAY KING',
			color: '#b7d3c1',
			bg: '#09232c',
			border: '#0ea5e9',
			tiers: [
				{ count: '15+', mult: 15.0 },
				{ count: '11-14', mult: 6.0 },
				{ count: '8-10', mult: 3.0 },
				{ count: '6-7', mult: 1.5 },
				{ count: '5', mult: 0.6 },
			],
		},
		{
			id: 'L3',
			name: 'QUEEN (Q)',
			subtitle: 'PUTTING QUEEN',
			color: '#bed69f',
			bg: '#082522',
			border: '#14b8a6',
			tiers: [
				{ count: '15+', mult: 12.0 },
				{ count: '11-14', mult: 5.0 },
				{ count: '8-10', mult: 2.5 },
				{ count: '6-7', mult: 1.0 },
				{ count: '5', mult: 0.4 },
			],
		},
		{
			id: 'L4',
			name: 'JACK (J)',
			subtitle: 'CADDIE JACK',
			color: '#b3c99a',
			bg: '#0b241b',
			border: '#10b981',
			tiers: [
				{ count: '15+', mult: 10.0 },
				{ count: '11-14', mult: 4.0 },
				{ count: '8-10', mult: 2.0 },
				{ count: '6-7', mult: 0.8 },
				{ count: '5', mult: 0.3 },
			],
		},
		{
			id: 'L5',
			name: 'TEN (10)',
			subtitle: 'SCORE TEN',
			color: '#c5d9a7',
			bg: '#0c1e15',
			border: '#a98b50',
			tiers: [
				{ count: '15+', mult: 8.0 },
				{ count: '11-14', mult: 3.0 },
				{ count: '8-10', mult: 1.5 },
				{ count: '6-7', mult: 0.5 },
				{ count: '5', mult: 0.2 },
			],
		},
	] as const;

	const formatCash = (mult: number) => {
		const val = mult * baseBet;
		return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	};
</script>

<div class="modal-card">
	<!-- Fixed Header -->
	<div class="modal-header">
		<div class="modal-title-row">
			<div class="modal-title-wrap">
				<h2 class="modal-title">BIRDIE BREAKOUT — RULES & PAYOUTS</h2>
			</div>
			<button class="modal-close-btn" onclick={closeModal} title="Close paytable">✕</button>
		</div>

		<!-- Tab Navigation Bar -->
		<div class="modal-tabs">
			<button
				class="tab-btn"
				class:active={activeTab === 'payouts'}
				onclick={() => (activeTab = 'payouts')}
			>
				Payouts
			</button>
			<button
				class="tab-btn"
				class:active={activeTab === 'features'}
				onclick={() => (activeTab = 'features')}
			>
				Bonus & Symbols
			</button>
			<button
				class="tab-btn"
				class:active={activeTab === 'rules'}
				onclick={() => (activeTab = 'rules')}
			>
				Game Rules
			</button>
		</div>
	</div>

	<!-- Scrollable Content Body -->
	<div class="modal-body">
		{#if activeTab === 'payouts'}
			<!-- Current Bet Scaler Banner -->
			<div class="bet-scaler-banner">
				<span>Payouts shown for your current bet of <strong>${baseBet.toFixed(2)} USD</strong></span
				>
			</div>

			<!-- High Paying Symbols -->
			<section class="section-block">
				<h3 class="section-title">HIGH-PAYING SYMBOLS</h3>
				<div class="symbols-grid high-grid">
					{#each highSymbols as sym}
						<div class="symbol-card">
							<div class="symbol-thumb-wrap">
								<img src={getSymbolImageUrl(sym.id)} alt={sym.name} class="symbol-img" />
							</div>
							<div class="symbol-info">
								<span class="sym-name" style="color: {sym.color};">{sym.name}</span>
								<span class="sym-sub">{sym.subtitle}</span>
							</div>
							<div class="payout-list">
								{#each sym.tiers as tier}
									<div class="tier-row">
										<span class="count">{tier.count}</span>
										<span class="cash">{formatCash(tier.mult)}</span>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- Low Paying Symbols -->
			<section class="section-block">
				<h3 class="section-title">LOW-PAYING SYMBOLS</h3>
				<div class="symbols-grid low-grid">
					{#each lowSymbols as sym}
						<div class="symbol-card">
							<div class="symbol-thumb-wrap low-thumb">
								<img src={getSymbolImageUrl(sym.id)} alt={sym.name} class="symbol-img" />
							</div>
							<div class="symbol-info">
								<span class="sym-name" style="color: {sym.color};">{sym.name}</span>
								<span class="sym-sub">{sym.subtitle}</span>
							</div>
							<div class="payout-list">
								{#each sym.tiers as tier}
									<div class="tier-row">
										<span class="count">{tier.count}</span>
										<span class="cash">{formatCash(tier.mult)}</span>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{:else if activeTab === 'features'}
			<!-- Special Symbols -->
			<section class="section-block">
				<h3 class="section-title">SPECIAL SYMBOLS</h3>
				<div class="specials-grid">
					<!-- Wild: Championship Trophy -->
					<div class="special-card">
						<div class="symbol-thumb-wrap special-thumb">
							<img src={getSymbolImageUrl('W')} alt="Wild trophy" class="symbol-img" />
						</div>
						<div class="special-desc">
							<h4>WILD TROPHY (W)</h4>
							<p>
								The gold trophy substitutes for every regular paying symbol to complete or extend
								winning clusters on the 5×5 grid.
							</p>
						</div>
					</div>

					<!-- Scatter: Golf flag -->
					<div class="special-card">
						<div class="symbol-thumb-wrap special-thumb">
							<img src={getSymbolImageUrl('S')} alt="Scatter flag" class="symbol-img" />
						</div>
						<div class="special-desc">
							<h4>SCATTER FLAG (S)</h4>
							<p>Land at least three Scatter flags anywhere on the grid to trigger Free Spins.</p>
							<ul>
								<li><strong>3 Scatters</strong> award 10 Free Spins</li>
								<li><strong>4 Scatters</strong> award 12 Free Spins</li>
								<li><strong>5+ Scatters</strong> award 15 Free Spins</li>
							</ul>
							<p>
								<strong>Retrigger</strong> Land at least three Scatters during the bonus to add
								<strong>5 Free Spins</strong>.
							</p>
						</div>
					</div>

					<!-- Multiplier: Golden Energy Golf Ball -->
					<div class="special-card">
						<div class="symbol-thumb-wrap special-thumb">
							<img src={getSymbolImageUrl('M')} alt="Multiplier ball" class="symbol-img" />
							<span class="multiplier-example">x50</span>
						</div>
						<div class="special-desc">
							<h4>MULTIPLIER BALL (M)</h4>
							<p>Golden golf balls carry one of these multipliers.</p>
							<ul>
								<li>x2, x3, x4, x5</li>
								<li>x10, x15, x25</li>
								<li>x50, x100, x250, x500, x1000</li>
							</ul>
							<p>
								<strong>Base Game</strong> Visible multipliers are added together and applied to the
								total spin win.
							</p>
							<p>
								<strong>Free Spins</strong> Multipliers are added to the
								<strong>global multiplier</strong>, which carries over between spins in the bonus.
							</p>
						</div>
					</div>
				</div>
			</section>
		{:else if activeTab === 'rules'}
			<!-- Technical Rules & Specifications -->
			<section class="section-block">
				<h3 class="section-title">GAME SPECIFICATIONS</h3>
				<div class="specs-grid">
					<div class="spec-box">
						<span class="label">GRID</span>
						<span class="val">5×5 Cluster Pays</span>
					</div>
					<div class="spec-box">
						<span class="label">THEORETICAL RTP</span>
						<span class="val highlight-green">96.00%</span>
					</div>
					<div class="spec-box">
						<span class="label">MAX WIN</span>
						<span class="val highlight-gold">100,000× Bet</span>
					</div>
					<div class="spec-box">
						<span class="label">VOLATILITY</span>
						<span class="val highlight-orange">Very High</span>
					</div>
				</div>

				<div class="rules-text">
					<p>
						<strong>Tumbles</strong> Five or more matching symbols connected horizontally or vertically
						form a winning cluster. The winning symbols disappear. Symbols above drop, and new symbols
						fill the gaps.
					</p>
					<p>
						<strong>Caddie Booster (3× Bet)</strong> Triples your chance of landing Scatter flags and
						entering Free Spins.
					</p>
					<p>
						<strong>Championship Bonus Buy (100× Bet)</strong> Starts Free Spins with at least three
						guaranteed Scatters.
					</p>
					<p>
						<strong>Max Win (100,000× Bet)</strong> The round ends immediately when the total reaches
						100,000 times the bet, and the maximum win is credited.
					</p>
				</div>
			</section>
		{/if}
	</div>
</div>

<style lang="scss">
	.modal-card {
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		color: #e2e8f0;
		box-sizing: border-box;
		width: min(92vw, calc(100vw - env(safe-area-inset-left) - env(safe-area-inset-right) - 16px));
		max-width: 840px;
		height: 82vh;
		height: 82dvh;
		max-height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 16px);
		background: #11251a;
		border: 3px solid #26180f;
		border-radius: 20px;
		box-shadow:
			0 0 0 1px #c6954a,
			0 10px 0 #352111,
			0 24px 50px #0d160ec2;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
		text-align: left;
	}

	.modal-header {
		padding: 20px 24px 0 24px;
		background: #23442e;
		border-bottom: 1px solid #c48f3e;
		flex-shrink: 0;

		@media (max-width: 600px) {
			padding: 12px 12px 0;
		}
	}

	.modal-title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.modal-title-wrap {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;

		@media (max-width: 600px) {
			gap: 6px;
		}
	}

	.modal-title {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 900;
		letter-spacing: 1px;
		color: #ffe292;
		text-shadow: 0 2px 0 #24170f;

		@media (max-width: 600px) {
			font-size: 15px;
		}
	}

	.modal-close-btn {
		width: 36px;
		height: 36px;
		flex-shrink: 0;
		border-radius: 10px;
		background: #132b1f;
		border: 1px solid #d09e4a;
		color: #ffe59c;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;

		&:hover {
			background: #e11d48;
			border-color: #f43f5e;
			color: #ffffff;
			transform: scale(1.05);
		}
	}

	.modal-tabs {
		display: flex;
		gap: 8px;
		overflow-x: auto;
	}

	.tab-btn {
		padding: 10px 18px;
		border-radius: 10px 10px 0 0;
		background: transparent;
		border: 1px solid transparent;
		border-bottom: none;
		color: #b3c99a;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		gap: 8px;
		white-space: nowrap;

		&:hover:not(.active) {
			color: #ffffff;
			background: #11281d;
		}

		&.active {
			background: #09130e;
			color: #facc15;
			border-color: #1a3d2b;
			border-bottom: 1px solid #09130e;
			margin-bottom: -1px;
		}
	}

	.modal-body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 24px;
		scrollbar-width: thin;
		scrollbar-color: #1a4d33 #09130e;

		&::-webkit-scrollbar {
			width: 8px;
		}
		&::-webkit-scrollbar-track {
			background: #09130e;
		}
		&::-webkit-scrollbar-thumb {
			background: #1a4d33;
			border-radius: 4px;
		}
	}

	.bet-scaler-banner {
		background: #213b2c;
		border: 1.5px solid #58774f;
		border-radius: 10px;
		padding: 10px 16px;
		font-size: 13px;
		color: #c5d9a7;
		display: flex;
		align-items: center;
		gap: 10px;

		strong {
			color: #facc15;
		}
	}

	.section-block {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.section-title {
		margin: 0;
		font-size: 11.5px;
		font-weight: 800;
		letter-spacing: 1.5px;
		color: #c5d9a7;
		text-transform: uppercase;
	}

	.symbols-grid {
		display: grid;
		gap: 12px;
	}

	.high-grid {
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
	}

	.low-grid {
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
	}

	.symbol-card {
		background: #0c1a13;
		border: 1.5px solid #193d2b;
		border-radius: 14px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		transition: all 0.15s ease;

		&:hover {
			border-color: #a98b50;
			background: #0f241a;
			transform: translateY(-2px);
		}
	}

	.symbol-thumb-wrap {
		position: relative;
		width: 64px;
		height: 64px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;

		&.low-thumb {
			width: 54px;
			height: 54px;
		}

		&.special-thumb {
			width: 72px;
			height: 72px;
			flex-shrink: 0;
		}
	}

	.symbol-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.multiplier-example {
		position: absolute;
		color: #fffdf1;
		font-size: 17px;
		font-weight: 900;
		-webkit-text-stroke: 3px #211104;
		paint-order: stroke fill;
	}

	.symbol-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 2px;
	}

	.sym-name {
		font-size: 12.5px;
		font-weight: 900;
		letter-spacing: 0.5px;
	}

	.sym-sub {
		font-size: 9px;
		font-weight: 700;
		color: #b3c99a;
		letter-spacing: 0.5px;
	}

	.payout-list {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-top: 2px;
	}

	.tier-row {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		padding: 2px 4px;
		border-bottom: 1px solid #132e20;

		&:last-child {
			border-bottom: none;
		}

		.count {
			color: #c5d9a7;
			font-weight: 600;
		}

		.cash {
			color: #ffffff;
			font-weight: 800;
			font-variant-numeric: tabular-nums;
		}
	}

	.specials-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.special-card {
		background: #0c1a13;
		border: 1.5px solid #193d2b;
		border-radius: 14px;
		padding: 16px;
		display: flex;
		gap: 18px;
		align-items: center;

		.special-desc {
			h4 {
				margin: 0 0 6px 0;
				font-size: 14px;
				font-weight: 900;
				color: #facc15;
			}

			p {
				margin: 0 0 6px 0;
				font-size: 12.5px;
				line-height: 1.5;
				color: #cbd5e1;

				&:last-child {
					margin-bottom: 0;
				}
			}

			ul {
				margin: 4px 0 6px 18px;
				padding: 0;
				font-size: 12.5px;
				color: #c3dbc6;

				li {
					margin-bottom: 2px;
				}
			}
		}
	}

	.specs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 12px;
	}

	.spec-box {
		background: #0c1a13;
		border: 1.5px solid #193d2b;
		border-radius: 10px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 4px;

		.label {
			font-size: 9.5px;
			font-weight: 700;
			color: #c5d9a7;
			letter-spacing: 1px;
		}

		.val {
			font-size: 15px;
			font-weight: 800;
			color: #ffffff;

			&.highlight-green {
				color: #a98b50;
			}
			&.highlight-gold {
				color: #facc15;
			}
			&.highlight-orange {
				color: #f97316;
			}
		}
	}

	.rules-text {
		background: #0c1a13;
		border: 1.5px solid #193d2b;
		border-radius: 10px;
		padding: 16px 20px;
		font-size: 12.5px;
		line-height: 1.6;
		color: #cbd5e1;

		p {
			margin: 0 0 10px 0;

			&:last-child {
				margin-bottom: 0;
			}
		}

		strong {
			color: #facc15;
		}
	}
</style>
