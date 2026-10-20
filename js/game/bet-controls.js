import { gameState } from "../core/game-state.js";
import { updateUI } from "../ui/ui-updater.js";
import { spinButton, betDownButton, betUpButton, maxBetButton } from "../ui/dom.js";
import gsap from "gsap";

/* =========================================================
   CONTROL STATE
========================================================= */

export function setControlsDisabled(disabled) {
    spinButton.disabled = disabled;

    betDownButton.disabled = disabled;

    betUpButton.disabled = disabled;

    maxBetButton.disabled = disabled;

    if (!disabled) {
        gsap.fromTo(spinButton, { scale: 0.95 }, { scale: 1, duration: 0.2, ease: "elastic.out(1, 0.5)" });
    }
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

        gsap.fromTo(betUpButton, { scale: 0.9 }, { scale: 1, duration: 0.1 });
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

        gsap.fromTo(betDownButton, { scale: 0.9 }, { scale: 1, duration: 0.1 });
    }
}

export function maxBet() {
    if (gameState.spinning) {
        return;
    }

    gameState.betIndex = gameState.betOptions.length - 1;

    gameState.bet = gameState.betOptions[gameState.betIndex];

    updateUI();

    gsap.fromTo(maxBetButton, { scale: 0.9 }, { scale: 1, duration: 0.1 });
}
