import { PIXI, type LoadedAssets, type LoadedSprite } from 'pixi-svelte';
import { GOLF_SYMBOL_ART } from './golfAssets';
import type { SymbolName } from './types';

export const getSymbolTexture = (assets: LoadedAssets, name: SymbolName) =>
	(assets[GOLF_SYMBOL_ART[name]] as LoadedSprite | undefined) ?? PIXI.Texture.EMPTY;

export function prepareSymbolTextures(assets: LoadedAssets) {
	for (const name of Object.values(GOLF_SYMBOL_ART)) {
		const texture = assets[name];
		if (texture instanceof PIXI.Texture) {
			// Static 512px tiles get mipmaps on their first upload, for smooth minification
			// as they rotate in small cells. All sprites of each symbol share the source.
			texture.source.scaleMode = 'linear';
			texture.source.autoGenerateMipmaps = true;
		}
	}
}

const multiplierLabels = new Map<number, PIXI.Texture>();

export const getMultiplierLabelTexture = (value: number): PIXI.Texture => {
	const cached = multiplierLabels.get(value);
	if (cached) return cached;
	if (typeof document === 'undefined') return PIXI.Texture.EMPTY;

	const canvas = document.createElement('canvas');
	canvas.width = 128;
	canvas.height = 56;
	const ctx = canvas.getContext('2d');
	if (!ctx) return PIXI.Texture.EMPTY;

	const label = `x${value}`;
	const fontSize = label.length >= 4 ? 34 : 42;
	ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.lineJoin = 'round';
	ctx.lineWidth = 7;
	ctx.strokeStyle = '#211104';
	ctx.fillStyle = '#fffdf1';
	ctx.strokeText(label, 64, 29, 116);
	ctx.fillText(label, 64, 29, 116);

	const texture = PIXI.Texture.from(canvas);
	multiplierLabels.set(value, texture);
	return texture;
};

export const warmMultiplierLabels = () =>
	[2, 3, 4, 5, 10, 15, 25, 50, 100, 250, 500, 1000].map(getMultiplierLabelTexture);
