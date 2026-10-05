import { REEL_STRIPS } from '../config/symbols.js';
import { REEL_COUNT, ROW_COUNT } from '../config/counts.js';

function randomInt(max) {
	return Math.floor(Math.random() * max);
}

export function randomSymbolForReel(reelIndex) {
	const strip = REEL_STRIPS[reelIndex];

	return strip[randomInt(strip.length)];
}


export function generateResult() {
	const result = [];

	for (let reelIndex = 0; reelIndex < REEL_COUNT; reelIndex++) {
		const strip = REEL_STRIPS[reelIndex];

		const stop = randomInt(strip.length);

		const column = [];

		for (let row = 0; row < ROW_COUNT; row++) {
			const index = (stop + row) % strip.length;

			column.push(strip[index]);
		}

		result.push(column);
	}

	return result;
}