const visibleSize = $state({ width: 0, height: 0 });

export function practiceViewport() {
	return {
		width: visibleSize.width || (typeof window === 'undefined' ? 1 : window.innerWidth),
		height: visibleSize.height || (typeof window === 'undefined' ? 1 : window.innerHeight),
	};
}

export function watchPracticeViewport(resize: (width: number, height: number) => void) {
	const viewport = window.visualViewport;
	const root = document.documentElement;
	function sync() {
		// Pinch-zoom is a user action, not a change of the gameplay layout.
		const visual = viewport && viewport.scale === 1 ? viewport : undefined;
		const width = Math.max(1, Math.floor(Math.min(window.innerWidth, visual?.width ?? Infinity)));
		const height = Math.max(
			1,
			Math.floor(Math.min(window.innerHeight, visual?.height ?? Infinity)),
		);
		root.style.setProperty('--practice-browser-inset', `${window.innerHeight - height}px`);
		if (visibleSize.width !== width || visibleSize.height !== height) {
			visibleSize.width = width;
			visibleSize.height = height;
		}
		resize(width, height);
	}

	sync();
	window.addEventListener('resize', sync);
	viewport?.addEventListener('resize', sync);
	return () => {
		window.removeEventListener('resize', sync);
		viewport?.removeEventListener('resize', sync);
		root.style.removeProperty('--practice-browser-inset');
	};
}
