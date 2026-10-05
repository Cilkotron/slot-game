import { PAYLINES } from "../config/paylines.js";
import { GAME_CONFIG } from "../config/game-config.js";
import { evaluateLine } from "./payline-evaluator.js";
import { roundMoney } from "../utils/helpers.js";

/* =========================================================
   CALCULATE LINE WINS
========================================================= */

export function calculateWins(result, bet, isFreeSpin) {
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
    const betPerLine = bet / PAYLINES.length;

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
