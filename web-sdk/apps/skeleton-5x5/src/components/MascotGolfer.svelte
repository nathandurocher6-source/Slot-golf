<script lang="ts">
	import { stateBet } from 'state-shared';

	// The mascot can react subtly when there's an active spin or win
	const isTurbo = $derived(stateBet.isTurbo);

	const MASCOT_SVG = `<svg viewBox="0 0 240 340" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="grassShadow" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#02140a" stop-opacity="0.75"/>
<stop offset="100%" stop-color="#02140a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#ffffff"/>
<stop offset="35%" stop-color="#cbd5e1"/>
<stop offset="70%" stop-color="#94a3b8"/>
<stop offset="100%" stop-color="#475569"/>
</linearGradient>
<linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" stop-color="#fef08a"/>
<stop offset="50%" stop-color="#eab308"/>
<stop offset="100%" stop-color="#a16207"/>
</linearGradient>
<linearGradient id="poloBlue" x1="0%" y1="0%" x2="0%" y2="100%">
<stop offset="0%" stop-color="#2563eb"/>
<stop offset="100%" stop-color="#1d4ed8"/>
</linearGradient>
<linearGradient id="bagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#1e293b"/>
<stop offset="50%" stop-color="#0f172a"/>
<stop offset="100%" stop-color="#020617"/>
</linearGradient>
</defs>
<ellipse cx="70" cy="326" rx="58" ry="12" fill="url(#grassShadow)"/>
<ellipse cx="176" cy="328" rx="46" ry="10" fill="url(#grassShadow)"/>
<g class="golf-bag-group">
<path d="M165 240 L135 325" stroke="#050a0e" stroke-width="5" stroke-linecap="round"/>
<path d="M165 240 L135 325" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
<path d="M178 240 L215 325" stroke="#050a0e" stroke-width="5" stroke-linecap="round"/>
<path d="M178 240 L215 325" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
<path d="M168 180 L156 122" stroke="#050a0e" stroke-width="6" stroke-linecap="round"/>
<path d="M168 180 L156 122" stroke="url(#chromeGrad)" stroke-width="3" stroke-linecap="round"/>
<path d="M156 122 Q144 110 136 116 Q130 124 142 128 Z" fill="url(#chromeGrad)" stroke="#050a0e" stroke-width="2.5"/>
<path d="M176 180 L174 115" stroke="#050a0e" stroke-width="6" stroke-linecap="round"/>
<path d="M176 180 L174 115" stroke="url(#chromeGrad)" stroke-width="3" stroke-linecap="round"/>
<path d="M174 115 Q184 104 192 108 Q198 116 186 122 Z" fill="url(#chromeGrad)" stroke="#050a0e" stroke-width="2.5"/>
<path d="M184 180 L195 130" stroke="#050a0e" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="196" cy="126" rx="15" ry="18" fill="#f43f5e" stroke="#050a0e" stroke-width="3.5"/>
<ellipse cx="196" cy="106" rx="7" ry="7" fill="#fbcfe8" stroke="#050a0e" stroke-width="2.5"/>
<path d="M162 180 L150 140" stroke="#050a0e" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="148" cy="136" rx="14" ry="16" fill="#00f0ff" stroke="#050a0e" stroke-width="3.5"/>
<ellipse cx="146" cy="118" rx="6" ry="6" fill="#cffafe" stroke="#050a0e" stroke-width="2.5"/>
<path d="M152 180 C152 174 196 174 196 180 L204 316 C204 322 144 322 144 316 Z" fill="url(#bagGrad)" stroke="#050a0e" stroke-width="5"/>
<path d="M156 195 C156 190 192 190 192 195 L198 290 C198 295 150 295 150 290 Z" fill="#10b981" stroke="#050a0e" stroke-width="3"/>
<circle cx="174" cy="235" r="9" fill="#fde047" stroke="#050a0e" stroke-width="2"/>
<path d="M170 238 L174 230 L178 238" stroke="#050a0e" stroke-width="2" stroke-linecap="round"/>
<rect x="186" y="250" width="22" height="42" rx="6" fill="#064e3b" stroke="#050a0e" stroke-width="2.5"/>
<circle cx="197" cy="265" r="5" fill="#ffffff" stroke="#050a0e" stroke-width="1.5"/>
<circle cx="197" cy="278" r="5" fill="#ffffff" stroke="#050a0e" stroke-width="1.5"/>
</g>
<g class="golfer-body-group">
<path d="M42 210 L18 322" stroke="#050a0e" stroke-width="6" stroke-linecap="round"/>
<path d="M42 210 L18 322" stroke="url(#chromeGrad)" stroke-width="3.5" stroke-linecap="round"/>
<path d="M18 322 Q10 320 6 325 Q8 332 22 330 Q26 328 18 322 Z" fill="#00f0ff" stroke="#050a0e" stroke-width="3"/>
<g>
<ellipse cx="54" cy="324" rx="18" ry="8" fill="#ffffff" stroke="#050a0e" stroke-width="3.5"/>
<path d="M46 317 Q54 316 62 317 L60 331 Q52 332 44 331 Z" fill="#0f172a"/>
</g>
<g>
<ellipse cx="94" cy="324" rx="17" ry="8" fill="#ffffff" stroke="#050a0e" stroke-width="3.5"/>
<path d="M86 317 Q94 316 102 317 L100 331 Q92 332 84 331 Z" fill="#0f172a"/>
</g>
<path d="M45 220 L40 318 L64 318 L76 250 L86 318 L108 318 L105 220 Z" fill="#e2d6b5" stroke="#050a0e" stroke-width="5" stroke-linejoin="round"/>
<path d="M52 235 L52 312" stroke="#c9bba0" stroke-width="2.5"/>
<path d="M96 235 L96 312" stroke="#c9bba0" stroke-width="2.5"/>
<rect x="44" y="212" width="62" height="11" rx="2" fill="#1e293b" stroke="#050a0e" stroke-width="3"/>
<rect x="68" y="210" width="16" height="15" rx="3" fill="url(#goldGrad)" stroke="#050a0e" stroke-width="2"/>
<path d="M40 148 L30 216 L118 216 L110 148 Z" fill="#ffffff" stroke="#050a0e" stroke-width="5" stroke-linejoin="round"/>
<path d="M38 148 L33 185 L44 185 L46 148 Z" fill="url(#poloBlue)" stroke="#050a0e" stroke-width="2"/>
<path d="M112 148 L117 185 L106 185 L104 148 Z" fill="url(#poloBlue)" stroke="#050a0e" stroke-width="2"/>
<path d="M75 148 L75 182" stroke="#050a0e" stroke-width="2.5"/>
<circle cx="75" cy="158" r="2" fill="#2563eb"/>
<circle cx="75" cy="170" r="2" fill="#2563eb"/>
<circle cx="60" cy="170" r="5" fill="#fde047" stroke="#050a0e" stroke-width="1.5"/>
<path d="M110 152 Q128 178 116 206 L104 208" stroke="#050a0e" stroke-width="11" stroke-linecap="round"/>
<path d="M110 152 Q128 178 116 206 L104 208" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/>
<ellipse cx="106" cy="208" rx="8" ry="7" fill="#ffffff" stroke="#050a0e" stroke-width="3"/>
<path d="M40 152 Q28 175 42 208" stroke="#050a0e" stroke-width="11" stroke-linecap="round"/>
<path d="M40 152 Q28 175 42 208" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/>
<ellipse cx="42" cy="208" rx="7" ry="6" fill="#fed7aa" stroke="#050a0e" stroke-width="2.5"/>
<rect x="66" y="132" width="18" height="18" fill="#fed7aa" stroke="#050a0e" stroke-width="3.5"/>
<path d="M50 100 Q48 140 75 142 Q102 140 100 100 Q98 70 75 70 Q52 70 50 100 Z" fill="#fed7aa" stroke="#050a0e" stroke-width="5"/>
<circle cx="58" cy="115" r="5" fill="#fca5a5" opacity="0.6"/>
<circle cx="92" cy="115" r="5" fill="#fca5a5" opacity="0.6"/>
<path d="M62 118 Q75 132 88 118" stroke="#050a0e" stroke-width="3.5" stroke-linecap="round" fill="#ffffff"/>
<path d="M68 126 Q75 130 82 126" stroke="#f43f5e" stroke-width="2" fill="none"/>
<ellipse cx="64" cy="104" rx="5" ry="6.5" fill="#ffffff" stroke="#050a0e" stroke-width="2.5"/>
<circle cx="65" cy="104" r="3.2" fill="#1e293b"/>
<circle cx="66" cy="102" r="1.2" fill="#ffffff"/>
<path d="M82 104 Q88 98 94 104" stroke="#050a0e" stroke-width="3.5" stroke-linecap="round" fill="none"/>
<path d="M58 95 Q64 92 70 95" stroke="#78350f" stroke-width="3.2" stroke-linecap="round" fill="none"/>
<path d="M80 94 Q86 91 92 95" stroke="#78350f" stroke-width="3.2" stroke-linecap="round" fill="none"/>
<path d="M49 96 Q46 112 51 116" stroke="#78350f" stroke-width="4.5" stroke-linecap="round" fill="none"/>
<path d="M101 96 Q104 112 99 116" stroke="#78350f" stroke-width="4.5" stroke-linecap="round" fill="none"/>
<path d="M48 85 Q75 52 102 85 Z" fill="#ffffff" stroke="#050a0e" stroke-width="5"/>
<path d="M46 84 Q75 78 104 84 L102 92 Q75 86 48 92 Z" fill="url(#poloBlue)" stroke="#050a0e" stroke-width="3.5"/>
<path d="M44 86 Q75 76 118 84 Q128 88 116 94 Q75 90 44 88 Z" fill="#ffffff" stroke="#050a0e" stroke-width="4.5"/>
<circle cx="82" cy="85" r="3" fill="#fde047" stroke="#050a0e" stroke-width="1.5"/>
</g>
</svg>`;

	const mascotDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(MASCOT_SVG)}`;
</script>

<div class="mascot-wrapper" class:turbo={isTurbo}>
	<img
		class="mascot-img"
		src={mascotDataUrl}
		alt="Fairway Mascot Golfer"
		width="200"
		height="280"
		loading="eager"
		decoding="async"
	/>
</div>

<style lang="scss">
	.mascot-wrapper {
		position: fixed;
		left: 20px;
		bottom: 78px;
		width: 200px;
		height: 280px;
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
		width: 100%;
		height: 100%;
		object-fit: contain;
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
