import { gameState } from "../core/game-state.js";
import { sleep, roundMoney, formatMoney } from "../utils/helpers.js";
import { calculateWins } from "../win-evaluation/win-calculator.js";
import { processFreeSpins } from "../win-evaluation/scatter-handler.js";
import { resetSymbolVisuals, highlightScatters } from "../visuals/symbol-visuals.js";
import { presentWins } from "../visuals/win-presentation.js";
import { setControlsDisabled } from "./bet-controls.js";
import { messageElement, winElement, betElement } from "../ui/dom.js";
import { animateBalance, animateWin, animateFreeSpins } from "../ui/ui-updater.js";
import { audioManager } from "../audio/audio-manager.js";

/* =========================================================
   SPIN
========================================================= */

export async function spin({
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
}) {
    if (gameState.spinning) {
        return;
    }

    const isFreeSpin = gameState.freeSpins > 0;

    if (!isFreeSpin && gameState.balance < gameState.bet) {
        messageElement.textContent = "NOT ENOUGH CREDIT";

        return;
    }

    /*
     * Cancel any previous win presentation.
     */
    gameState.winPresentationToken++;

    resetSymbolVisuals(reelViews, paylineLayer, BUFFER_ROWS, SYMBOL_HEIGHT);

    gameState.spinning = true;

    setControlsDisabled(true);

    winElement.textContent = "0";

    /*
     * Deduct exactly one TOTAL BET for a paid spin.
     */
    if (isFreeSpin) {
        gameState.freeSpins--;
        animateFreeSpins(gameState.freeSpins);
    } else {
        gameState.balance = roundMoney(gameState.balance - gameState.bet);
        animateBalance(gameState.balance);

        // Reset autoplay flag when starting a paid spin
        gameState.autoPlayEnabled = true;
    }

    betElement.textContent = formatMoney(gameState.bet);

    messageElement.textContent = isFreeSpin ? "FREE SPIN" : "GOOD LUCK";

    audioManager.playSpinSound();

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
        symbolWidth: SYMBOL_WIDTH,
        totalRenderedRows: TOTAL_RENDERED_ROWS,
        bufferRows: BUFFER_ROWS,
        randomSymbolForReel,
        clamp,
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
    const winResult = calculateWins(result, gameState.bet, isFreeSpin);

    /*
     * Process scatter awards.
     */
    const scatterResult = processFreeSpins(result, isFreeSpin);

    /*
     * Add the final payout to the balance.
     */
    if (winResult.totalWin > 0) {
        gameState.balance = roundMoney(gameState.balance + winResult.totalWin);
        animateBalance(gameState.balance);
        animateWin(winResult.totalWin);
    } else {
        winElement.textContent = "0";
    }

    animateFreeSpins(gameState.freeSpins);

    /*
     * Present a free-spin trigger first.
     */
    if (scatterResult.awarded > 0) {
        audioManager.playScatterSound();
        highlightScatters(
            scatterResult.positions,
            reelViews,
            paylineLayer,
            BUFFER_ROWS,
            SYMBOL_WIDTH,
            SYMBOL_HEIGHT
        );

        messageElement.textContent =
            `${scatterResult.count} SCATTERS • ` + `+${scatterResult.awarded} FREE SPINS`;

        await sleep(1200);
    }

    /*
     * Present line wins one by one.
     */
    if (winResult.wins.length > 0) {
        await presentWins(
            winResult.wins,
            winResult.totalWin,
            messageElement,
            reelViews,
            paylineLayer,
            BUFFER_ROWS,
            SYMBOL_WIDTH,
            SYMBOL_HEIGHT
        );
    } else if (scatterResult.awarded === 0) {
        resetSymbolVisuals(reelViews, paylineLayer, BUFFER_ROWS, SYMBOL_HEIGHT);

        messageElement.textContent =
            gameState.freeSpins > 0 ? `FREE SPINS LEFT ${gameState.freeSpins}` : "PRESS SPIN";
    }

    gameState.spinning = false;

    /*
     * Continue free spins automatically if autoplay is enabled.
     */
    if (gameState.freeSpins > 0 && gameState.autoPlayEnabled) {
        await sleep(700);

        resetSymbolVisuals(reelViews, paylineLayer, BUFFER_ROWS, SYMBOL_HEIGHT);

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
        });
    } else {
        setControlsDisabled(false);

        // Re-enable autoplay if free spins still exist
        if (gameState.freeSpins > 0 && !gameState.autoPlayEnabled) {
            messageElement.textContent = `FREE SPINS LEFT ${gameState.freeSpins} • PRESS SPIN`;
        }
    }
}
