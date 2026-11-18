<script lang="ts">
	import { initMockRgs } from '../game/mockRgs';
	initMockRgs();

	import { type Snippet } from 'svelte';
	import { GlobalStyle } from 'components-ui-html';
	import { Authenticate, LoaderStakeEngine, LoaderExample, LoadI18n } from 'components-shared';
	import Game from '../components/Game.svelte';
	import { setContext } from '../game/context';

	import messagesMap from '../i18n/messagesMap';

	type Props = { children: Snippet };

	const props: Props = $props();

	let showYourLoader = $state(false);

	setContext();
</script>

<GlobalStyle>
	<Authenticate>
		<LoadI18n {messagesMap}>
			<Game />
		</LoadI18n>
	</Authenticate>
</GlobalStyle>

<LoaderStakeEngine src="./stake-engine-loader.gif" oncomplete={() => (showYourLoader = true)} />

{#if showYourLoader}
	<LoaderExample src="./loader.gif" />
{/if}

{@render props.children()}
