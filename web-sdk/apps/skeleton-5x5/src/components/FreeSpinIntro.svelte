<script lang="ts" module>
	export type EmitterEventFreeSpinIntro =
		| { type: 'freeSpinIntroShow' }
		| { type: 'freeSpinIntroHide' }
		| { type: 'freeSpinIntroUpdate'; totalFreeSpins: number };
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { CanvasSizeRectangle, MainContainer } from 'components-layout';
	import { OnHotkey } from 'components-shared';
	import { FadeContainer } from 'components-pixi';
	import { waitForResolve } from 'utils-shared/wait';
	import { Container, Rectangle, Text } from 'pixi-svelte';
	import { stateBet } from 'state-shared';

	import { getContext } from '../game/context';

	const context = getContext();

	let show = $state(false);
	let totalFreeSpins = $state(0);
	let oncomplete = $state<() => void>(() => {});
	let autoTimeout: ReturnType<typeof setTimeout> | null = null;
	let hasResolved = false;

	const continueAction = () => {
		if (hasResolved) return;
		hasResolved = true;

		if (autoTimeout) {
			clearTimeout(autoTimeout);
			autoTimeout = null;
		}

		removeWindowListeners();
		oncomplete();
	};

	const onWindowPointer = () => {
		if (show) continueAction();
	};

	const onWindowKey = (e: KeyboardEvent) => {
		if (show && (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape' || e.key === ' ')) {
			e.preventDefault();
			continueAction();
		}
	};

	const addWindowListeners = () => {
		if (typeof window !== 'undefined') {
			window.addEventListener('pointerdown', onWindowPointer, { capture: true });
			window.addEventListener('keydown', onWindowKey, { capture: true });
		}
	};

	const removeWindowListeners = () => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('pointerdown', onWindowPointer, { capture: true });
			window.removeEventListener('keydown', onWindowKey, { capture: true });
		}
	};

	onDestroy(() => {
		removeWindowListeners();
		if (autoTimeout) clearTimeout(autoTimeout);
	});

	context.eventEmitter.subscribeOnMount({
		freeSpinIntroShow: () => {
			show = true;
			hasResolved = false;
			addWindowListeners();
		},
		freeSpinIntroHide: () => {
			show = false;
			removeWindowListeners();
			if (autoTimeout) clearTimeout(autoTimeout);
		},
		freeSpinIntroUpdate: async (emitterEvent) => {
			totalFreeSpins = emitterEvent.totalFreeSpins;
			hasResolved = false;
			addWindowListeners();

			// Auto-continue timer for Turbo / Autoplay / Safety fallback
			const isTurbo = stateBet.isTurbo;
			const isAuto = context.stateXstateDerived.isAutoBetting();
			const timeoutDuration = isTurbo ? 350 : isAuto ? 750 : 2500;

			autoTimeout = setTimeout(() => {
				continueAction();
			}, timeoutDuration);

			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});

	const canvasSizes = $derived(context.stateLayoutDerived.canvasSizes());
	const CARD_WIDTH = $derived(Math.min(canvasSizes.width * 0.88, 540));
	const CARD_HEIGHT = 240;
</script>

<FadeContainer {show}>
	<!-- Transparent screen capture: grid remains 100% visible and bright -->
	<CanvasSizeRectangle
		backgroundColor={0x000000}
		backgroundAlpha={0}
		zIndex={100}
		eventMode="static"
		cursor="pointer"
		onpointerup={continueAction}
	/>

	<!-- Fullscreen Click & Hotkey Handling -->
	<OnHotkey hotkey="Space" onpress={continueAction} />
	<OnHotkey hotkey="Enter" onpress={continueAction} />

	<!-- Interactive Transparent Touch Overlay with high z-index -->
	<CanvasSizeRectangle
		backgroundColor={0xffffff}
		backgroundAlpha={0.0001}
		zIndex={120}
		eventMode="static"
		cursor="pointer"
		onpointerup={continueAction}
	/>

	<MainContainer>
		<Container
			x={context.stateGameDerived.boardLayout().x}
			y={context.stateGameDerived.boardLayout().y}
			zIndex={121}
			eventMode="static"
			cursor="pointer"
			onpointerup={continueAction}
		>
			<!-- Deep Drop Shadow Plate -->
			<Rectangle
				y={7}
				width={CARD_WIDTH + 14}
				height={CARD_HEIGHT + 14}
				borderRadius={28}
				backgroundColor={0x000000}
				backgroundAlpha={0.92}
				anchor={0.5}
			/>

			<!-- Golden Championship Glow Halo -->
			<Rectangle
				width={CARD_WIDTH + 16}
				height={CARD_HEIGHT + 16}
				borderRadius={28}
				backgroundColor={0xfacc15}
				backgroundAlpha={0.35}
				borderColor={0xffe066}
				borderWidth={2.5}
				anchor={0.5}
			/>

			<!-- Modal Card Base (Deep Obsidian Green) -->
			<Rectangle
				width={CARD_WIDTH}
				height={CARD_HEIGHT}
				borderRadius={22}
				backgroundColor={0x091c14}
				backgroundAlpha={0.98}
				borderColor={0xfacc15}
				borderWidth={3}
				anchor={0.5}
			/>

			<!-- Header Badge -->
			<Rectangle
				y={-CARD_HEIGHT * 0.5 + 26}
				width={260}
				height={32}
				borderRadius={8}
				backgroundColor={0x123d28}
				borderColor={0x22c55e}
				borderWidth={1.5}
				anchor={0.5}
			/>

			<Text
				y={-CARD_HEIGHT * 0.5 + 26}
				text="TEE TIME CHAMPIONSHIP"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 13,
					fontWeight: '900',
					fill: 0x86efac,
					letterSpacing: 2,
				}}
			/>

			<!-- Total Spins Awarded Text -->
			<Text
				y={-6}
				text={`${totalFreeSpins} TOURS GRATUITS`}
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 34,
					fontWeight: '900',
					fill: 0xfacc15,
				}}
			/>

			<!-- Subtitle -->
			<Text
				y={40}
				text="MULTIPLICATEUR GLOBAL PROGRESSIF ACTIF"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 12,
					fontWeight: '800',
					fill: 0x4ade80,
					letterSpacing: 1.2,
				}}
			/>

			<!-- Continue prompt -->
			<Text
				y={CARD_HEIGHT * 0.5 - 20}
				text="CLIQUEZ OU APPUYEZ SUR ESPACE"
				anchor={0.5}
				style={{
					fontFamily: 'system-ui, -apple-system, sans-serif',
					fontSize: 11,
					fontWeight: '700',
					fill: 0x86efac,
					letterSpacing: 1.5,
				}}
			/>
		</Container>
	</MainContainer>
</FadeContainer>
