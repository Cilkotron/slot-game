import { gameState } from "../core/game-state.js";
import { formatMoney } from "../utils/helpers.js";
import { balanceElement, betElement, freeSpinsElement, winElement, stopAutoPlayContainer } from "./dom.js";
import gsap from "gsap";

/* =========================================================
   UI
========================================================= */

export function updateUI() {
    balanceElement.textContent = formatMoney(gameState.balance);

    betElement.textContent = formatMoney(gameState.bet);

    freeSpinsElement.textContent = gameState.freeSpins;
}

export function animateBalance(newBalance) {
    const oldBalance = parseFloat(balanceElement.textContent.replace(/,/g, "")) || 0;

    gsap.to(
        { value: oldBalance },
        {
            value: newBalance,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: function () {
                balanceElement.textContent = formatMoney(this.targets()[0].value);
            },
        }
    );
}

export function animateWin(winAmount) {
    winElement.textContent = formatMoney(winAmount);

    gsap.fromTo(
        winElement,
        { scale: 1.5, color: "#86efac" },
        { scale: 1, color: "#4ade80", duration: 0.5, ease: "elastic.out(1, 0.5)" }
    );
}

export function animateFreeSpins(count) {
    freeSpinsElement.textContent = count;

    if (count > 0) {
        gsap.fromTo(
            freeSpinsElement,
            { scale: 1.3, color: "#22d3ee" },
            { scale: 1, color: "#22d3ee", duration: 0.5, ease: "elastic.out(1, 0.5)" }
        );

        // Show stop autoplay button
        stopAutoPlayContainer.classList.remove("hidden");
        stopAutoPlayContainer.classList.add("flex");
    } else {
        // Hide stop autoplay button
        stopAutoPlayContainer.classList.add("hidden");
        stopAutoPlayContainer.classList.remove("flex");
    }
}
