import { PIXI, type LoadedAssets, type LoadedSprite } from 'pixi-svelte';
import { GOLF_SYMBOL_ART } from './golfAssets';
import type { SymbolName } from './types';

export const getSymbolTexture = (assets: LoadedAssets, name: SymbolName) =>
	(assets[GOLF_SYMBOL_ART[name]] as LoadedSprite | undefined) ?? PIXI.Texture.EMPTY;

const multiplierLabels = new Map<number, PIXI.Texture>();
let multiplierAura: PIXI.Texture | undefined;

export const getMultiplierAuraTexture = (): PIXI.Texture => {
	if (multiplierAura) return multiplierAura;
	if (typeof document === 'undefined') return PIXI.Texture.EMPTY;

	const canvas = document.createElement('canvas');
	canvas.width = 128;
	canvas.height = 128;
	const ctx = canvas.getContext('2d');
	if (!ctx) return PIXI.Texture.EMPTY;

	const aura = ctx.createRadialGradient(64, 64, 36, 64, 64, 64);
	aura.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
	aura.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
	aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
	ctx.fillStyle = aura;
	ctx.fillRect(0, 0, 128, 128);

	multiplierAura = PIXI.Texture.from(canvas);
	return multiplierAura;
};

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

export const warmMultiplierLabels = () => {
	getMultiplierAuraTexture();
	for (const value of [2, 3, 4, 5, 10, 15, 25, 50, 100, 250, 500, 1000]) {
		getMultiplierLabelTexture(value);
	}
};
