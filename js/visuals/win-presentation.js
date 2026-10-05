import { gameState } from "../core/game-state.js";
import { sleep, formatMoney } from "../utils/helpers.js";
import { highlightWin, highlightAllWins, resetSymbolVisuals } from "./symbol-visuals.js";
import { drawPayline } from "./payline-drawing.js";

/* =========================================================
   PRESENT WINS
========================================================= */

export async function presentWins(
    wins,
    totalWin,
    messageElement,
    reelViews,
    paylineLayer,
    BUFFER_ROWS,
    SYMBOL_WIDTH,
    SYMBOL_HEIGHT
) {
    const token = ++gameState.winPresentationToken;

    if (wins.length === 0) {
        resetSymbolVisuals(reelViews, paylineLayer, BUFFER_ROWS, SYMBOL_HEIGHT);

        return;
    }

    for (const win of wins) {
        if (token !== gameState.winPresentationToken) {
            return;
        }

        highlightWin(win, reelViews, paylineLayer, BUFFER_ROWS, SYMBOL_WIDTH, SYMBOL_HEIGHT);

        drawPayline(paylineLayer, win.line, win.count, SYMBOL_WIDTH, SYMBOL_HEIGHT);

        messageElement.textContent =
            `LINE ${win.lineIndex + 1} • ` + `WIN ${formatMoney(win.amount)}`;

        await sleep(750);
    }

    if (token !== gameState.winPresentationToken) {
        return;
    }

    highlightAllWins(wins, reelViews, paylineLayer, BUFFER_ROWS, SYMBOL_WIDTH, SYMBOL_HEIGHT);

    messageElement.textContent = `TOTAL WIN ${formatMoney(totalWin)}`;
}
