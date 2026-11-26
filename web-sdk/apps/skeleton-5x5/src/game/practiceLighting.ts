function mixColor(day: number, sunset: number, amount: number) {
	const channel = (shift: number) => {
		const from = (day >> shift) & 255;
		const to = (sunset >> shift) & 255;
		return Math.round(from + (to - from) * amount) << shift;
	};
	return channel(16) | channel(8) | channel(0);
}

export function getPracticeLighting(sunset: number) {
	return {
		scenery: mixColor(0xffffff, 0xffe4d7, sunset),
		platform: mixColor(0xffffff, 0xf8dabb, sunset),
		frame: mixColor(0xffffff, 0xffeede, sunset),
		contact: mixColor(0x354029, 0x3c302f, sunset),
		terrace: mixColor(0x54412d, 0x513538, sunset),
		shadowStrength: 1 - sunset * 0.13,
	};
}

export type PracticeLighting = ReturnType<typeof getPracticeLighting>;
