import { GAME_CONFIG } from "../config/game-config.js";
/* =========================================================
   GAME STATE
========================================================= */

export const gameState = {
    balance: GAME_CONFIG.startingBalance,

    bet: GAME_CONFIG.defaultBet,

    freeSpins: 0,

    spinning: false,

    winPresentationToken: 0,

    betOptions: GAME_CONFIG.betOptions,

    betIndex: GAME_CONFIG.betOptions.indexOf(
        GAME_CONFIG.defaultBet
    )
};