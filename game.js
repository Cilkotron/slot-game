"use strict";

import { REEL_COUNT, ROW_COUNT } from "./js/config/counts.js";

import { createReels } from "./js/reels/reel-manager.js";
import { animateReels } from "./js/reels/reel-animation.js";
import { randomSymbolForReel, generateResult } from "./js/core/random.js";

import { initPixi, createGameLayers } from "./js/graphics/pixi-setup.js";
import { createBackground } from "./js/graphics/background.js";
import { resizeGame } from "./js/graphics/responsive.js";
import { canvasContainer } from "./js/ui/dom.js";
import { updateUI } from "./js/ui/ui-updater.js";
import { increaseBet, decreaseBet, maxBet } from "./js/game/bet-controls.js";
import { setupEventHandlers } from "./js/game/event-handlers.js";
import { spin } from "./js/game/spin.js";
import { clamp } from "./js/utils/helpers.js";
import { audioManager } from "./js/audio/audio-manager.js";

const BUFFER_ROWS = 2;

const TOTAL_RENDERED_ROWS = ROW_COUNT + BUFFER_ROWS * 2;

const GAME_WIDTH = 1000;

const GAME_HEIGHT = 600;

const SYMBOL_WIDTH = GAME_WIDTH / REEL_COUNT;

const SYMBOL_HEIGHT = GAME_HEIGHT / ROW_COUNT;

/* =========================================================
   INITIALIZATION
========================================================= */

let app;
let gameStage;
let reelLayer;
let paylineLayer;
let reelViews;

async function init() {
    app = await initPixi();

    const layers = createGameLayers(app);

    gameStage = layers.gameStage;
    reelLayer = layers.reelLayer;
    paylineLayer = layers.paylineLayer;

    createBackground(reelLayer, GAME_WIDTH, GAME_HEIGHT);

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

    resizeGame(app, gameStage, GAME_WIDTH, GAME_HEIGHT);

    const observer = new ResizeObserver(() => resizeGame(app, gameStage, GAME_WIDTH, GAME_HEIGHT));

    observer.observe(canvasContainer);

    setupEventHandlers(
        () =>
            spin({
                reelViews,
                paylineLayer,
                BUFFER_ROWS,
                SYMBOL_WIDTH,
                SYMBOL_HEIGHT,
                REEL_COUNT,
                GAME_HEIGHT,
                TOTAL_RENDERED_ROWS,
                randomSymbolForReel,
                generateResult,
                animateReels,
                clamp,
            }),
        increaseBet,
        decreaseBet,
        maxBet
    );

    // Initialize audio and start background music
    audioManager.init();
    audioManager.startBackgroundMusic();
}

/* =========================================================
   START GAME
========================================================= */

init();
