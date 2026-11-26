<script lang="ts">
	import { initMockRgs } from '../game/mockRgs';
	initMockRgs();

	import { onMount, type Snippet } from 'svelte';
	import { GlobalStyle } from 'components-ui-html';
	import { Authenticate } from 'components-shared';
	import { stateI18nDerived } from 'state-shared';
	import Game from '../components/Game.svelte';
	import { setContext } from '../game/context';
	import { stateApp } from '../game/stateApp';
	import { branding } from '../game/branding';

	import messagesMap from '../i18n/messagesMap';

	type Props = { children: Snippet };

	const props: Props = $props();

	setContext();

	let englishReady = $state(false);
	onMount(() => {
		stateI18nDerived.init('en', messagesMap.en);
		englishReady = true;
	});
</script>

<GlobalStyle>
	<Authenticate>
		{#if englishReady}
			<Game />
		{/if}
	</Authenticate>
</GlobalStyle>

{#if !stateApp.loaded}
	<div class="clubhouse-loading" role="status" aria-label={`Loading ${branding.title}`}>
		<img src={branding.logo} alt={branding.title} />
		<span></span>
	</div>
{/if}

{@render props.children()}

<style>
	.clubhouse-loading {
		position: fixed;
		inset: 0;
		display: grid;
		justify-items: center;
		align-content: center;
		gap: 18px;
		background: radial-gradient(ellipse at 50% 45%, #396037, #14291e 67%, #101b15);
		z-index: 54;
		pointer-events: none;
	}
	.clubhouse-loading img {
		width: min(72vw, 420px, 93vh);
	}
	.clubhouse-loading span {
		width: 66px;
		height: 4px;
		border-radius: 8px;
		background: #ffd465;
		transform-origin: left;
		animation: loading 1s ease-in-out infinite alternate;
	}
	@keyframes loading {
		from {
			transform: scaleX(0.26);
			opacity: 0.55;
		}
		to {
			transform: scaleX(1);
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.clubhouse-loading span {
			animation: none;
		}
	}
</style>
