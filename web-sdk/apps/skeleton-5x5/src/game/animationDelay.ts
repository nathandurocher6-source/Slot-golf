export function animationDelay(duration: number, signal: AbortSignal) {
	if (signal.aborted) return Promise.resolve(false);

	return new Promise<boolean>((resolve) => {
		const cancel = () => {
			clearTimeout(timer);
			resolve(false);
		};
		const timer = setTimeout(() => {
			signal.removeEventListener('abort', cancel);
			resolve(true);
		}, duration);
		signal.addEventListener('abort', cancel, { once: true });
	});
}
