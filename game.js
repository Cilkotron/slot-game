'use strict';

import { GAME_CONFIG } from './js/config/game-config.js';
import { PAYTABLE } from './js/config/paytable.js';
import { PAYLINES } from './js/config/paylines.js';
import { REEL_COUNT, ROW_COUNT } from './js/config/counts.js';

import { gameState } from './js/core/game-state.js';
import { createReels, getVisibleView } from './js/reels/reel-manager.js';
import { animateReels } from './js/reels/reel-animation.js';
import { randomSymbolForReel, generateResult } from './js/core/random.js';


const BUFFER_ROWS = 2;

const TOTAL_RENDERED_ROWS = ROW_COUNT + BUFFER_ROWS * 2;

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;

const SYMBOL_WIDTH = GAME_WIDTH / REEL_COUNT;

const SYMBOL_HEIGHT = GAME_HEIGHT / ROW_COUNT;

//const SYMBOL_GAP = 8;

/* =========================================================
   DOM REFERENCES
========================================================= */

const canvasContainer = document.getElementById('gameCanvas');

const balanceElement = document.getElementById('balance');

const betElement = document.getElementById('bet');

const winElement = document.getElementById('win');

const freeSpinsElement = document.getElementById('freeSpins');

const messageElement = document.getElementById('message');

const spinButton = document.getElementById('spin');

const betDownButton = document.getElementById('betDown');

const betUpButton = document.getElementById('betUp');

const maxBetButton = document.getElementById('maxBetButton');

const paytableButton = document.getElementById('paytableButton');

const paytableModal = document.getElementById('paytableModal');

const closePaytableButton = document.getElementById('closePaytable');

/* =========================================================
   PIXI
========================================================= */

const app = new PIXI.Application();

const gameStage = new PIXI.Container();

const reelLayer = new PIXI.Container();

const paylineLayer = new PIXI.Container();

let reelViews = [];

/* =========================================================
   GENERAL HELPERS
========================================================= */


function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

/* =========================================================
   MONEY HELPERS
========================================================= */

function roundMoney(value) {
	return Math.round(value * 100) / 100;
}

function formatMoney(value) {
	const rounded = roundMoney(value);

	if (Number.isInteger(rounded)) {
		return String(rounded);
	}

	return rounded.toFixed(2);
}

/* =========================================================
   BET HELPERS
========================================================= */

function getBetPerLine() {
	return gameState.bet / PAYLINES.length;
}

/* =========================================================
   INITIALIZATION
========================================================= */

async function init() {
	await app.init({
		width: 1,

		height: 1,

		backgroundColor: 0x05070d,

		antialias: true,

		resolution: Math.min(window.devicePixelRatio || 1, 2),

		autoDensity: true,
	});

	canvasContainer.appendChild(app.canvas);

	app.canvas.style.display = 'block';

	app.canvas.style.width = '100%';

	app.canvas.style.height = '100%';

	app.stage.addChild(gameStage);

	gameStage.addChild(reelLayer);

	gameStage.addChild(paylineLayer);

	createBackground();

	reelViews = createReels({
		reelLayer,
		reelCount: REEL_COUNT,
		totalRenderedRows: TOTAL_RENDERED_ROWS,
		bufferRows: BUFFER_ROWS,
		symbolWidth: SYMBOL_WIDTH,
		symbolHeight: SYMBOL_HEIGHT,
		gameHeight: GAME_HEIGHT,
		randomSymbolForReel,
	});

	updateUI();

	resizeGame();

	const observer = new ResizeObserver(resizeGame);

	observer.observe(canvasContainer);
}

/* =========================================================
   RESPONSIVE RENDERING
========================================================= */

function resizeGame() {
	const width = canvasContainer.clientWidth;

	const height = canvasContainer.clientHeight;

	if (width <= 0 || height <= 0) {
		return;
	}

	app.renderer.resize(width, height);

	const scale = Math.min(
		width / GAME_WIDTH,

		height / GAME_HEIGHT,
	);

	gameStage.scale.set(scale);

	gameStage.x = (width - GAME_WIDTH * scale) / 2;

	gameStage.y = (height - GAME_HEIGHT * scale) / 2;
}

/* =========================================================
   BACKGROUND
========================================================= */

function createBackground() {
	const background = new PIXI.Graphics();

	background.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);

	background.fill(0x080b12);

	reelLayer.addChild(background);
}


/* =========================================================
   GET PAYLINE SYMBOLS
========================================================= */

function getLineSymbols(result, line) {
	return line.map((row, reelIndex) => result[reelIndex][row]);
}

/* =========================================================
   EVALUATE PAYLINE
========================================================= */

function evaluateLine(result, line) {
	const symbols = getLineSymbols(result, line);

	// Scatter does not participate in regular line wins.
	if (symbols[0] === 'SCATTER') {
		return null;
	}

	/*
	 * Find the first regular symbol.
	 * Leading WILD symbols adopt this symbol.
	 */
	let target = null;

	for (const symbol of symbols) {
		if (symbol !== 'WILD' && symbol !== 'SCATTER') {
			target = symbol;
			break;
		}
	}

	/*
	 * If the entire sequence starts with WILDs and no
	 * regular symbol is found, evaluate it as a WILD win.
	 */
	if (!target) {
		target = 'WILD';
	}

	let count = 0;

	/*
	 * Count consecutive matching symbols from left to right.
	 */
	for (const symbol of symbols) {
		if (symbol === target || symbol === 'WILD') {
			count++;
		} else {
			break;
		}
	}

	if (count < 3) {
		return null;
	}

	const multiplier = PAYTABLE[target]?.[count];

	if (multiplier === undefined) {
		return null;
	}

	/*
	 * If the line begins with WILD symbols, also check
	 * whether a pure WILD combination pays more.
	 */
	let leadingWilds = 0;

	for (const symbol of symbols) {
		if (symbol === 'WILD') {
			leadingWilds++;
		} else {
			break;
		}
	}

	if (
		leadingWilds >= 3 &&
		PAYTABLE.WILD?.[leadingWilds] !== undefined &&
		PAYTABLE.WILD[leadingWilds] > multiplier
	) {
		return {
			symbol: 'WILD',
			count: leadingWilds,
			multiplier: PAYTABLE.WILD[leadingWilds],
		};
	}

	return {
		symbol: target,
		count,
		multiplier,
	};
}

/* =========================================================
   CALCULATE LINE WINS
========================================================= */

function calculateWins(result, isFreeSpin) {
	let totalWin = 0;

	const wins = [];

	/*
	 * BET is the total stake.
	 *
	 * Example:
	 *
	 * BET = 100
	 * 10 PAYLINES
	 * Bet per line = 10
	 */
	const betPerLine = getBetPerLine();

	PAYLINES.forEach((line, lineIndex) => {
		const win = evaluateLine(result, line);

		if (!win) {
			return;
		}

		const amount = roundMoney(win.multiplier * betPerLine);

		totalWin = roundMoney(totalWin + amount);

		wins.push({
			...win,

			line: [...line],

			lineIndex,

			amount,
		});
	});

	/*
	 * Keep extreme demo outcomes under control.
	 *
	 * This does not replace proper RTP calibration.
	 */
	const maximumMultiplier = isFreeSpin
		? GAME_CONFIG.maxFreeSpinWinMultiplier
		: GAME_CONFIG.maxBaseGameWinMultiplier;

	const maximumWin = bet * maximumMultiplier;

	if (totalWin > maximumWin) {
		const ratio = maximumWin / totalWin;

		for (const win of wins) {
			win.amount = roundMoney(win.amount * ratio);
		}

		totalWin = roundMoney(maximumWin);
	}

	return {
		totalWin,

		wins,
	};
}

/* =========================================================
   FIND SCATTERS
========================================================= */

function findScatters(result) {
	const positions = [];

	for (let reel = 0; reel < REEL_COUNT; reel++) {
		for (let row = 0; row < ROW_COUNT; row++) {
			if (result[reel][row] === 'SCATTER') {
				positions.push({
					reel,

					row,
				});
			}
		}
	}

	return positions;
}

/* =========================================================
   FREE SPINS
========================================================= */

function processFreeSpins(result, isFreeSpin) {
	const positions = findScatters(result);

	const count = positions.length;

	let awarded = 0;

	/*
	 * Free spins cannot retrigger additional free spins
	 * unless explicitly enabled in GAME_CONFIG.
	 */
	const canAward = !isFreeSpin || GAME_CONFIG.allowFreeSpinRetrigger;

	if (canAward) {
		if (count >= 5) {
			awarded = 12;
		} else if (count === 4) {
			awarded = 8;
		} else if (count === 3) {
			awarded = 5;
		}
	}

	gameState.freeSpins = Math.min(
		gameState.freeSpins + awarded,

		GAME_CONFIG.maxFreeSpins,
	);

	return {
		count,

		awarded,

		positions,
	};
}

/* =========================================================
   RESET SYMBOL VISUALS
========================================================= */

function resetSymbolVisuals() {
	for (let reel = 0; reel < REEL_COUNT; reel++) {
		for (let row = 0; row < ROW_COUNT; row++) {
			const view = getVisibleView(reelViews, reel, row, BUFFER_ROWS);

			view.alpha = 1;

			view.scale.set(1);

			view.x = 0;

			view.y = row * SYMBOL_HEIGHT;
		}
	}

	paylineLayer.removeChildren();
}

/* =========================================================
   DRAW WINNING PAYLINE

   Only the symbols that actually participate in the win
   are connected by the line.
========================================================= */

function drawPayline(line, count) {
	paylineLayer.removeChildren();

	const points = line.slice(0, count).map((row, reel) => ({
		x: reel * SYMBOL_WIDTH + SYMBOL_WIDTH / 2,

		y: row * SYMBOL_HEIGHT + SYMBOL_HEIGHT / 2,
	}));

	if (points.length < 2) {
		return;
	}

	const outline = new PIXI.Graphics();

	outline.moveTo(points[0].x, points[0].y);

	for (let i = 1; i < points.length; i++) {
		outline.lineTo(points[i].x, points[i].y);
	}

	outline.stroke({
		width: 14,

		color: 0x000000,

		alpha: 0.7,
	});

	const lineGraphic = new PIXI.Graphics();

	lineGraphic.moveTo(points[0].x, points[0].y);

	for (let i = 1; i < points.length; i++) {
		lineGraphic.lineTo(points[i].x, points[i].y);
	}

	lineGraphic.stroke({
		width: 7,

		color: 0xffd700,

		alpha: 1,
	});

	paylineLayer.addChild(outline);

	paylineLayer.addChild(lineGraphic);
}

/* =========================================================
   HIGHLIGHT SINGLE WIN
========================================================= */

function highlightWin(win) {
	resetSymbolVisuals();

	/*
	 * Dim all visible symbols.
	 */
	for (let reel = 0; reel < REEL_COUNT; reel++) {
		for (let row = 0; row < ROW_COUNT; row++) {
			getVisibleView(reelViews, reel, row, BUFFER_ROWS).alpha = 0.28;
		}
	}

	/*
	 * Highlight only the symbols that participate
	 * in the winning combination.
	 */
	for (let reel = 0; reel < win.count; reel++) {
		const row = win.line[reel];

		const view = getVisibleView(reelViews, reel, row, BUFFER_ROWS);

		view.alpha = 1;

		const scale = 1.06;

		view.scale.set(scale);

		view.x = -(SYMBOL_WIDTH * (scale - 1)) / 2;

		view.y = row * SYMBOL_HEIGHT - (SYMBOL_HEIGHT * (scale - 1)) / 2;
	}

	drawPayline(win.line, win.count);
}

/* =========================================================
   HIGHLIGHT ALL WINS
========================================================= */

function highlightAllWins(wins) {
	resetSymbolVisuals();

	const winningPositions = new Set();

	for (const win of wins) {
		for (let reel = 0; reel < win.count; reel++) {
			winningPositions.add(`${reel}:${win.line[reel]}`);
		}
	}

	for (let reel = 0; reel < REEL_COUNT; reel++) {
		for (let row = 0; row < ROW_COUNT; row++) {
			let view = getVisibleView(reelViews, reel, row, BUFFER_ROWS);

			const key = `${reel}:${row}`;

			if (winningPositions.has(key)) {
				view.alpha = 1;

				const scale = 1.04;

				view.scale.set(scale);

				view.x = -(SYMBOL_WIDTH * (scale - 1)) / 2;

				view.y = row * SYMBOL_HEIGHT - (SYMBOL_HEIGHT * (scale - 1)) / 2;
			} else {
				view.alpha = 0.4;
			}
		}
	}
}

/* =========================================================
   HIGHLIGHT SCATTERS
========================================================= */

function highlightScatters(positions) {
	resetSymbolVisuals();

	for (let reel = 0; reel < REEL_COUNT; reel++) {
		for (let row = 0; row < ROW_COUNT; row++) {
			getVisibleView(reelViews, reel, row, BUFFER_ROWS).alpha = 0.3;
		}
	}

	for (const position of positions) {
		const view = getVisibleView(
			reelViews,
			position.reel,
			position.row,
			BUFFER_ROWS,
		);

		view.alpha = 1;

		const scale = 1.08;

		view.scale.set(scale);

		view.x = -(SYMBOL_WIDTH * (scale - 1)) / 2;

		view.y = position.row * SYMBOL_HEIGHT - (SYMBOL_HEIGHT * (scale - 1)) / 2;
	}
}

/* =========================================================
   PRESENT WINS
========================================================= */

async function presentWins(wins, totalWin) {
	const token = ++gameState.winPresentationToken;

	if (wins.length === 0) {
		resetSymbolVisuals();

		return;
	}

	for (const win of wins) {
		if (token !== gameState.winPresentationToken) {
			return;
		}

		highlightWin(win);

		messageElement.textContent =
			`LINE ${win.lineIndex + 1} • ` + `WIN ${formatMoney(win.amount)}`;

		await sleep(750);
	}

	if (token !== gameState.winPresentationToken) {
		return;
	}

	highlightAllWins(wins);

	messageElement.textContent = `TOTAL WIN ${formatMoney(totalWin)}`;
}

/* =========================================================
   UI
========================================================= */

function updateUI() {
	balanceElement.textContent = formatMoney(gameState.balance);

	betElement.textContent = formatMoney(gameState.bet);

	freeSpinsElement.textContent = gameState.freeSpins;
}

/* =========================================================
   CONTROL STATE
========================================================= */

function setControlsDisabled(disabled) {
	spinButton.disabled = disabled;

	betDownButton.disabled = disabled;

	betUpButton.disabled = disabled;

	maxBetButton.disabled = disabled;
}

/* =========================================================
   SPIN
========================================================= */

async function spin() {
	if (gameState.spinning) {
		return;
	}

	const isFreeSpin = gameState.freeSpins > 0;

	if (!isFreeSpin && gameState.balance < gameState.bet) {
		messageElement.textContent = 'NOT ENOUGH CREDIT';

		return;
	}

	/*
	 * Cancel any previous win presentation.
	 */
	gameState.winPresentationToken++;

	resetSymbolVisuals();

	gameState.spinning = true;

	setControlsDisabled(true);

	winElement.textContent = '0';

	/*
	 * Deduct exactly one TOTAL BET for a paid spin.
	 */
	if (isFreeSpin) {
		gameState.freeSpins--;
	} else {
		gameState.balance = roundMoney(gameState.balance - gameState.bet);
	}

	updateUI();

	messageElement.textContent = isFreeSpin ? 'FREE SPIN' : 'GOOD LUCK';

	/*
	 * Determine the result before starting the animation.
	 */
	const result = generateResult();

	await animateReels({
        reelViews,
        result,
        reelCount: REEL_COUNT,
        gameHeight: GAME_HEIGHT,
        symbolHeight: SYMBOL_HEIGHT,
        totalRenderedRows: TOTAL_RENDERED_ROWS,
        bufferRows: BUFFER_ROWS,
        randomSymbolForReel,
        clamp
    });
	console.table({
		reel1: result[0],
		reel2: result[1],
		reel3: result[2],
		reel4: result[3],
		reel5: result[4],
	});

	/*
	 * Calculate wins using BET PER LINE.
	 */
	const winResult = calculateWins(result, isFreeSpin);

	/*
	 * Process scatter awards.
	 */
	const scatterResult = processFreeSpins(result, isFreeSpin);

	/*
	 * Add the final payout to the balance.
	 */
	if (winResult.totalWin > 0) {
		gameState.balance = roundMoney(gameState.balance + winResult.totalWin);
	}

	winElement.textContent = formatMoney(winResult.totalWin);

	updateUI();

	/*
	 * Present a free-spin trigger first.
	 */
	if (scatterResult.awarded > 0) {
		highlightScatters(scatterResult.positions);

		messageElement.textContent =
			`${scatterResult.count} SCATTERS • ` +
			`+${scatterResult.awarded} FREE SPINS`;

		await sleep(1200);
	}

	/*
	 * Present line wins one by one.
	 */
	if (winResult.wins.length > 0) {
		await presentWins(
			winResult.wins,

			winResult.totalWin,
		);
	} else if (scatterResult.awarded === 0) {
		resetSymbolVisuals();

		messageElement.textContent =
			gameState.freeSpins > 0
				? `FREE SPINS LEFT ${gameState.freeSpins}`
				: 'PRESS SPIN';
	}

	gameState.spinning = false;

	/*
	 * Continue free spins automatically.
	 */
	if (gameState.freeSpins > 0) {
		await sleep(700);

		resetSymbolVisuals();

		spin();
	} else {
		setControlsDisabled(false);
	}
}

/* =========================================================
   BET CONTROLS
========================================================= */

function increaseBet() {
	if (gameState.spinning) {
		return;
	}

	if (gameState.betIndex < gameState.betOptions.length - 1) {
		gameState.betIndex++;

		bet = gameState.betOptions[gameState.betIndex];

		updateUI();
	}
}

function decreaseBet() {
	if (gameState.spinning) {
		return;
	}

	if (gameState.betIndex > 0) {
		gameState.betIndex--;

		gameState.bet = gameState.betOptions[gameState.betIndex];

		updateUI();
	}
}

function maxBet() {
	if (gameState.spinning) {
		return;
	}

	gameState.betIndex = gameState.betOptions.length - 1;

	gameState.bet = gameState.betOptions[gameState.betIndex];

	updateUI();
}

/* =========================================================
   PAYTABLE MODAL
========================================================= */

function openPaytable() {
	paytableModal.classList.remove('hidden');

	paytableModal.classList.add('flex');
}

function closePaytable() {
	paytableModal.classList.add('hidden');

	paytableModal.classList.remove('flex');
}

/* =========================================================
   EVENTS
========================================================= */

spinButton.addEventListener('click', spin);

betUpButton.addEventListener('click', increaseBet);

betDownButton.addEventListener('click', decreaseBet);

maxBetButton.addEventListener('click', maxBet);

paytableButton.addEventListener('click', openPaytable);

closePaytableButton.addEventListener('click', closePaytable);

paytableModal.addEventListener('click', (event) => {
	if (event.target === paytableModal) {
		closePaytable();
	}
});

document.addEventListener('keydown', (event) => {
	if (event.code === 'Escape') {
		closePaytable();

		return;
	}

	if (event.code !== 'Space') {
		return;
	}

	if (!paytableModal.classList.contains('hidden')) {
		return;
	}

	event.preventDefault();

	spin();
});

/* =========================================================
   START GAME
========================================================= */

init();
