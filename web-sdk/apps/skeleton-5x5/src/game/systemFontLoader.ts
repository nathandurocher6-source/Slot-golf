// The SDK waits for this callback before it initializes the renderer.
export default {
	load({ active }: { active: () => void }) {
		void document.fonts.ready.then(active);
	},
};
