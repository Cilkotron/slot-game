import { REEL_COUNT, ROW_COUNT } from "../config/counts.js";
import { getVisibleView } from "../reels/reel-manager.js";
import gsap from "gsap";

/* =========================================================
   RESET SYMBOL VISUALS
========================================================= */

export function resetSymbolVisuals(reelViews, paylineLayer, BUFFER_ROWS, SYMBOL_HEIGHT) {
    for (let reel = 0; reel < REEL_COUNT; reel++) {
        for (let row = 0; row < ROW_COUNT; row++) {
            const view = getVisibleView(reelViews, reel, row, BUFFER_ROWS);

            gsap.to(view, {
                alpha: 1,
                duration: 0.2,
            });

            gsap.to(view.scale, {
                x: 1,
                y: 1,
                duration: 0.2,
            });

            gsap.to(view, {
                x: 0,
                y: row * SYMBOL_HEIGHT,
                duration: 0.2,
            });
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
            gsap.to(getVisibleView(reelViews, reel, row, BUFFER_ROWS), {
                alpha: 0.28,
                duration: 0.2,
            });
        }
    }

    /*
     * Highlight only the symbols that participate
     * in the winning combination.
     */
    for (let reel = 0; reel < win.count; reel++) {
        const row = win.line[reel];

        const view = getVisibleView(reelViews, reel, row, BUFFER_ROWS);

        const scale = 1.06;

        gsap.to(view, {
            alpha: 1,
            duration: 0.2,
        });

        gsap.to(view.scale, {
            x: scale,
            y: scale,
            duration: 0.2,
            ease: "back.out(1.7)",
        });

        gsap.to(view, {
            x: -(SYMBOL_WIDTH * (scale - 1)) / 2,
            y: row * SYMBOL_HEIGHT - (SYMBOL_HEIGHT * (scale - 1)) / 2,
            duration: 0.2,
        });
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
                const scale = 1.04;

                gsap.to(view, {
                    alpha: 1,
                    duration: 0.2,
                });

                gsap.to(view.scale, {
                    x: scale,
                    y: scale,
                    duration: 0.2,
                    ease: "back.out(1.7)",
                });

                gsap.to(view, {
                    x: -(SYMBOL_WIDTH * (scale - 1)) / 2,
                    y: row * SYMBOL_HEIGHT - (SYMBOL_HEIGHT * (scale - 1)) / 2,
                    duration: 0.2,
                });
            } else {
                gsap.to(view, {
                    alpha: 0.4,
                    duration: 0.2,
                });
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
            gsap.to(getVisibleView(reelViews, reel, row, BUFFER_ROWS), {
                alpha: 0.3,
                duration: 0.2,
            });
        }
    }

    for (const position of positions) {
        const view = getVisibleView(reelViews, position.reel, position.row, BUFFER_ROWS);

        const scale = 1.08;

        gsap.to(view, {
            alpha: 1,
            duration: 0.2,
        });

        gsap.to(view.scale, {
            x: scale,
            y: scale,
            duration: 0.2,
            ease: "back.out(1.7)",
        });

        gsap.to(view, {
            x: -(SYMBOL_WIDTH * (scale - 1)) / 2,
            y: position.row * SYMBOL_HEIGHT - (SYMBOL_HEIGHT * (scale - 1)) / 2,
            duration: 0.2,
        });
    }
}
