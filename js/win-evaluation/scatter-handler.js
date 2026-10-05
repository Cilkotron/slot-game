import { GAME_CONFIG } from "../config/game-config.js";
import { REEL_COUNT, ROW_COUNT } from "../config/counts.js";
import { gameState } from "../core/game-state.js";

/* =========================================================
   FIND SCATTERS
========================================================= */

export function findScatters(result) {
    const positions = [];

    for (let reel = 0; reel < REEL_COUNT; reel++) {
        for (let row = 0; row < ROW_COUNT; row++) {
            if (result[reel][row] === "SCATTER") {
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

export function processFreeSpins(result, isFreeSpin) {
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

        GAME_CONFIG.maxFreeSpins
    );

    return {
        count,

        awarded,

        positions,
    };
}
