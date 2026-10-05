import { REEL_COUNT, ROW_COUNT } from "../config/counts.js";
import { getVisibleView } from "../reels/reel-manager.js";

/* =========================================================
   RESET SYMBOL VISUALS
========================================================= */

export function resetSymbolVisuals(reelViews, paylineLayer, BUFFER_ROWS, SYMBOL_HEIGHT) {
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
   HIGHLIGHT SINGLE WIN
========================================================= */

export function highlightWin(
    win,
    reelViews,
    paylineLayer,
    BUFFER_ROWS,
    SYMBOL_WIDTH,
    SYMBOL_HEIGHT
) {
    resetSymbolVisuals(reelViews, paylineLayer, BUFFER_ROWS, SYMBOL_HEIGHT);

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
}

/* =========================================================
   HIGHLIGHT ALL WINS
========================================================= */

export function highlightAllWins(
    wins,
    reelViews,
    paylineLayer,
    BUFFER_ROWS,
    SYMBOL_WIDTH,
    SYMBOL_HEIGHT
) {
    resetSymbolVisuals(reelViews, paylineLayer, BUFFER_ROWS, SYMBOL_HEIGHT);

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

export function highlightScatters(
    positions,
    reelViews,
    paylineLayer,
    BUFFER_ROWS,
    SYMBOL_WIDTH,
    SYMBOL_HEIGHT
) {
    resetSymbolVisuals(reelViews, paylineLayer, BUFFER_ROWS, SYMBOL_HEIGHT);

    for (let reel = 0; reel < REEL_COUNT; reel++) {
        for (let row = 0; row < ROW_COUNT; row++) {
            getVisibleView(reelViews, reel, row, BUFFER_ROWS).alpha = 0.3;
        }
    }

    for (const position of positions) {
        const view = getVisibleView(reelViews, position.reel, position.row, BUFFER_ROWS);

        view.alpha = 1;

        const scale = 1.08;

        view.scale.set(scale);

        view.x = -(SYMBOL_WIDTH * (scale - 1)) / 2;

        view.y = position.row * SYMBOL_HEIGHT - (SYMBOL_HEIGHT * (scale - 1)) / 2;
    }
}
