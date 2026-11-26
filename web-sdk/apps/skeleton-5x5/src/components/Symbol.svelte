<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import SymbolGreybox from './SymbolGreybox.svelte';

	const props: ComponentProps<typeof SymbolGreybox> = $props();
</script>

<SymbolGreybox {...props} />
