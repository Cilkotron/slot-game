import { gameState } from "../core/game-state.js";
import { formatMoney } from "../utils/helpers.js";
import { balanceElement, betElement, freeSpinsElement } from "./dom.js";

/* =========================================================
   UI
========================================================= */

export function updateUI() {
    balanceElement.textContent = formatMoney(gameState.balance);

    betElement.textContent = formatMoney(gameState.bet);

    freeSpinsElement.textContent = gameState.freeSpins;
}
