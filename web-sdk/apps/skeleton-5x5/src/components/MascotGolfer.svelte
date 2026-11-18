<script lang="ts">
	import { stateBet } from 'state-shared';

	import { golfAssetUrl } from '../game/golfAssets';

	const isTurbo = $derived(stateBet.isTurbo);
</script>

<div class="mascot-wrapper" class:turbo={isTurbo}>
	<img
		class="mascot-img"
		src={golfAssetUrl('mascot')}
		alt="Mascotte de Birdie Breakout"
		width="230"
		height="322"
		loading="eager"
		decoding="async"
	/>
</div>

<style lang="scss">
	.mascot-wrapper {
		position: fixed;
		left: 20px;
		bottom: 106px;
		width: 230px;
		height: 322px;
		max-height: max(0px, calc(100vh - 346px));
		z-index: 45;
		pointer-events: none;
		user-select: none;
		transform: translate3d(0, 0, 0);
		backface-visibility: hidden;
		perspective: 1000px;
		will-change: transform;
		animation: mascotIdle 4.8s ease-in-out infinite;

		/* Hide properly on mobile, tablet & small screens so it never overlaps the 5x5 board */
		@media (max-width: 1140px) {
			display: none;
		}

		&.turbo {
			animation-duration: 2.4s;
		}
	}

	.mascot-img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		object-position: center bottom;
		transform: translateZ(0);
		pointer-events: none;
	}

	@keyframes mascotIdle {
		0%,
		100% {
			transform: translate3d(0, 0, 0);
		}
		50% {
			transform: translate3d(0, -6px, 0);
		}
	}
</style>
