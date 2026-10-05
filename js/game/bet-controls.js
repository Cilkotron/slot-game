import { gameState } from "../core/game-state.js";
import { updateUI } from "../ui/ui-updater.js";
import { spinButton, betDownButton, betUpButton, maxBetButton } from "../ui/dom.js";

/* =========================================================
   CONTROL STATE
========================================================= */

export function setControlsDisabled(disabled) {
    spinButton.disabled = disabled;

    betDownButton.disabled = disabled;

    betUpButton.disabled = disabled;

    maxBetButton.disabled = disabled;
}

/* =========================================================
   BET CONTROLS
========================================================= */

export function increaseBet() {
    if (gameState.spinning) {
        return;
    }

    if (gameState.betIndex < gameState.betOptions.length - 1) {
        gameState.betIndex++;

        gameState.bet = gameState.betOptions[gameState.betIndex];

        updateUI();
    }
}

export function decreaseBet() {
    if (gameState.spinning) {
        return;
    }

    if (gameState.betIndex > 0) {
        gameState.betIndex--;

        gameState.bet = gameState.betOptions[gameState.betIndex];

        updateUI();
    }
}

export function maxBet() {
    if (gameState.spinning) {
        return;
    }

    gameState.betIndex = gameState.betOptions.length - 1;

    gameState.bet = gameState.betOptions[gameState.betIndex];

    updateUI();
}
