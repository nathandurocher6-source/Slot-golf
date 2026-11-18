<script lang="ts">
	import { stateBet, stateModal } from 'state-shared';
	import { getSymbolDataUrl } from '../game/symbolTextureCache';

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
			name: 'DRIVER TITANE',
			subtitle: 'TÊTE CARBONE & BLEU ÉLECTRIQUE',
			desc: 'Tête de driver aérodynamique avec face usinée laser et traînée dynamique.',
			color: '#67e8f9',
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
			name: 'VOITURETTE DE GOLF',
			subtitle: 'CART BLANC & ÉMERAUDE',
			desc: 'Buggy de fairway tout confort avec sac de clubs fixé à l’arrière.',
			color: '#a7f3d0',
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
			name: 'FERS CHROMÉS',
			subtitle: 'PAIRE DE FERS CROISÉS',
			desc: 'Fers forgés en acier chromé brillant avec stries de frappe et étincelle.',
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
			name: 'TEES DE GOLF',
			subtitle: 'DUO ROSE & TURQUOISE',
			desc: 'Tees de golf fluo plantés dans une touffe d’herbe verte fraîche.',
			color: '#fda4af',
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
	];

	// Low paying golf symbols (A, K, Q, J, 10 with golf green & ball dimples)
	const lowSymbols = [
		{
			id: 'L1',
			name: 'AS (A)',
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
			name: 'ROI (K)',
			subtitle: 'FAIRWAY KING',
			color: '#7dd3fc',
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
			name: 'REINE (Q)',
			subtitle: 'PUTTING QUEEN',
			color: '#5eead4',
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
			name: 'VALET (J)',
			subtitle: 'CADDIE JACK',
			color: '#6ee7b7',
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
			name: 'DIX (10)',
			subtitle: 'SCORE TEN',
			color: '#86efac',
			bg: '#0c1e15',
			border: '#22c55e',
			tiers: [
				{ count: '15+', mult: 8.0 },
				{ count: '11-14', mult: 3.0 },
				{ count: '8-10', mult: 1.5 },
				{ count: '6-7', mult: 0.5 },
				{ count: '5', mult: 0.2 },
			],
		},
	];

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
				<span class="badge-studio">STAKE ENGINE</span>
				<h2 class="modal-title">FAIRWAY CHAMPIONS — RÈGLES & PAIEMENTS</h2>
			</div>
			<button class="modal-close-btn" onclick={closeModal} title="Fermer la fenêtre">✕</button>
		</div>

		<!-- Tab Navigation Bar -->
		<div class="modal-tabs">
			<button class="tab-btn" class:active={activeTab === 'payouts'} onclick={() => (activeTab = 'payouts')}>
				<span class="tab-badge">1</span> Paiements
			</button>
			<button class="tab-btn" class:active={activeTab === 'features'} onclick={() => (activeTab = 'features')}>
				<span class="tab-badge">2</span> Bonus & Symboles
			</button>
			<button class="tab-btn" class:active={activeTab === 'rules'} onclick={() => (activeTab = 'rules')}>
				<span class="tab-badge">3</span> Spécifications & Règles
			</button>
		</div>
	</div>

	<!-- Scrollable Content Body -->
	<div class="modal-body">
		{#if activeTab === 'payouts'}
			<!-- Current Bet Scaler Banner -->
			<div class="bet-scaler-banner">
				<span class="bet-scaler-icon">⛳</span>
				<span>Gains calculés en direct sur votre mise actuelle : <strong>${baseBet.toFixed(2)} USD</strong></span>
			</div>

			<!-- High Paying Symbols -->
			<section class="section-block">
				<h3 class="section-title">SYMBOLES FORTS (HIGH PAYS GOLF)</h3>
				<div class="symbols-grid high-grid">
					{#each highSymbols as sym}
						<div class="symbol-card">
							<div class="symbol-thumb-wrap">
								<img
									src={getSymbolDataUrl({ name: sym.id })}
									alt={sym.name}
									class="symbol-img"
								/>
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
				<h3 class="section-title">SYMBOLES BASIQUES (GREEN & FAIRWAY)</h3>
				<div class="symbols-grid low-grid">
					{#each lowSymbols as sym}
						<div class="symbol-card">
							<div class="symbol-thumb-wrap low-thumb">
								<img
									src={getSymbolDataUrl({ name: sym.id })}
									alt={sym.name}
									class="symbol-img"
								/>
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
				<h3 class="section-title">SYMBOLES SPÉCIAUX DU TOURNOI</h3>
				<div class="specials-grid">
					<!-- Wild: Championship Trophy -->
					<div class="special-card">
						<div class="symbol-thumb-wrap special-thumb">
							<img src={getSymbolDataUrl({ name: 'W' })} alt="Trophée Wild" class="symbol-img" />
						</div>
						<div class="special-desc">
							<h4>TROPHÉE WILD (W) — COUPE EN OR MASSIF</h4>
							<p>La prestigieuse Coupe de Championnat en or 24 carats fait office de symbole Wild. Elle se substitue à tous les symboles payants réguliers (Driver, Voiturette, Fers, Tees, A, K, Q, J, 10) pour compléter ou étendre les clusters gagnants sur la grille 5x5.</p>
						</div>
					</div>

					<!-- Scatter: Green & Flag #18 -->
					<div class="special-card">
						<div class="symbol-thumb-wrap special-thumb">
							<img src={getSymbolDataUrl({ name: 'S' })} alt="Drapeau 18 Scatter" class="symbol-img" />
						</div>
						<div class="special-desc">
							<h4>DRAPEAU N°18 SCATTER (S) — TOURS GRATUITS</h4>
							<p>Le 18ème trou du championnat ! Obtenez 3 symboles Scatters ou plus n'importe où sur la grille pour déclencher la séquence de Tours Gratuits :</p>
							<ul>
								<li><strong>3 Scatters :</strong> 10 Tours Gratuits</li>
								<li><strong>4 Scatters :</strong> 12 Tours Gratuits</li>
								<li><strong>5+ Scatters :</strong> 15 Tours Gratuits</li>
							</ul>
							<p><strong>Prolongation (Retrigger) :</strong> Obtenir 3 Scatters ou plus pendant le jeu bonus accorde <strong>+5 Tours Gratuits supplémentaires</strong>.</p>
						</div>
					</div>

					<!-- Multiplier: Golden Energy Golf Ball -->
					<div class="special-card">
						<div class="symbol-thumb-wrap special-thumb">
							<img src={getSymbolDataUrl({ name: 'M', multiplier: 50 })} alt="Balle Multiplicateur" class="symbol-img" />
						</div>
						<div class="special-desc">
							<h4>BALLE MULTIPLICATEUR (M) — VALEURS DE x2 À x1000</h4>
							<p>Une balle de golf dorée chargée d'énergie qui atterrit avec un multiplicateur spectaculaire :</p>
							<ul>
								<li><strong>Aura Émeraude :</strong> Multiplicateurs x2, x3, x4, x5</li>
								<li><strong>Aura Or :</strong> Multiplicateurs x10, x15, x25</li>
								<li><strong>Aura Flamme / Rubis :</strong> Multiplicateurs x50, x100, x250, x500, x1000</li>
							</ul>
							<p><strong>En Jeu de Base :</strong> Tous les multiplicateurs visibles s'additionnent et multiplient l'ensemble des gains du spin.</p>
							<p><strong>En Tours Gratuits :</strong> Les multiplicateurs alimentent le <strong>Multiplicateur Global Progressif</strong> qui persiste entre les spins et ne se réinitialise jamais !</p>
						</div>
					</div>
				</div>
			</section>

		{:else if activeTab === 'rules'}
			<!-- Technical Rules & Specifications -->
			<section class="section-block">
				<h3 class="section-title">CARACTÉRISTIQUES DU JEU & MOTEUR MATHÉMATIQUE</h3>
				<div class="specs-grid">
					<div class="spec-box">
						<span class="label">GRILLE</span>
						<span class="val">5x5 Cluster Pays</span>
					</div>
					<div class="spec-box">
						<span class="label">RTP THÉORIQUE</span>
						<span class="val highlight-green">96.00%</span>
					</div>
					<div class="spec-box">
						<span class="label">PLAFOND MAX WIN</span>
						<span class="val highlight-gold">x100 000 Mise</span>
					</div>
					<div class="spec-box">
						<span class="label">VOLATILITÉ</span>
						<span class="val highlight-orange">Très Haute</span>
					</div>
				</div>

				<div class="rules-text">
					<p><strong>Mécanique de Tumble (Cascades) :</strong> Tout groupe de 5 symboles identiques ou plus connectés horizontalement ou verticalement forme un cluster gagnant. Les symboles payants explosent et disparaissent. Les symboles au-dessus chutent par gravité et de nouveaux symboles tombent du ciel pour combler les vides.</p>
					<p><strong>Option Caddie Booster (3x Mise) :</strong> Triple vos chances naturelles d'obtenir les Scatters Drapeau 18 et d'accéder au mode Tours Gratuits.</p>
					<p><strong>Option Championship Bonus Buy (100x Mise) :</strong> Déclenche instantanément la séquence de Tours Gratuits avec un minimum de 3 Scatters garantis.</p>
					<p><strong>Plafond Max Win x100 000 :</strong> Si le cumul des gains d'un spin atteint ou dépasse 100 000 fois la mise, la partie s'arrête immédiatement et le gain maximal de x100 000 est crédité.</p>
				</div>
			</section>
		{/if}
	</div>
</div>

<style lang="scss">
	.modal-card {
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		color: #e2e8f0;
		width: 92vw;
		max-width: 840px;
		height: 82vh;
		max-height: 82vh;
		background: #09130e;
		border: 1.5px solid #1c4430;
		border-radius: 20px;
		box-shadow: 0 24px 70px rgba(0, 0, 0, 0.95), 0 0 35px rgba(34, 197, 94, 0.15);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
		text-align: left;
	}

	.modal-header {
		padding: 20px 24px 0 24px;
		background: #0d1e16;
		border-bottom: 1.5px solid #1a3d2b;
		flex-shrink: 0;
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
	}

	.badge-studio {
		background: #14532d;
		color: #86efac;
		border: 1px solid #22c55e;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 1.5px;
		padding: 3px 8px;
		border-radius: 6px;
	}

	.modal-title {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 900;
		letter-spacing: 1px;
		color: #facc15;

		@media (max-width: 600px) {
			font-size: 0.95rem;
		}
	}

	.modal-close-btn {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: #132b1f;
		border: 1px solid #1e4d35;
		color: #86efac;
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
		color: #6ee7b7;
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

	.tab-badge {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #143322;
		font-size: 10.5px;
		font-weight: 800;
		display: flex;
		align-items: center;
		justify-content: center;
		color: inherit;
	}

	.tab-btn.active .tab-badge {
		background: #facc15;
		color: #052213;
	}

	.modal-body {
		flex: 1;
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
		background: rgba(34, 197, 94, 0.12);
		border: 1.5px solid rgba(34, 197, 94, 0.4);
		border-radius: 10px;
		padding: 10px 16px;
		font-size: 13px;
		color: #86efac;
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
		color: #86efac;
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
			border-color: #22c55e;
			background: #0f241a;
			transform: translateY(-2px);
		}
	}

	.symbol-thumb-wrap {
		width: 64px;
		height: 64px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6));

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
		color: #6ee7b7;
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
			color: #86efac;
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
				color: #a7f3d0;

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
			color: #86efac;
			letter-spacing: 1px;
		}

		.val {
			font-size: 15px;
			font-weight: 800;
			color: #ffffff;

			&.highlight-green {
				color: #22c55e;
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
