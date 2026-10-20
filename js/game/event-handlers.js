import {
    spinButton,
    betUpButton,
    betDownButton,
    maxBetButton,
    musicToggle,
    muteToggle,
    stopAutoPlayButton,
    getPaytableModal,
} from "../ui/dom.js";
import { setupPaytableModal, closePaytable } from "./paytable-modal.js";
import { audioManager } from "../audio/audio-manager.js";
import { gameState } from "../core/game-state.js";
import gsap from "gsap";

/* =========================================================
   EVENT HANDLERS
========================================================= */

export function setupEventHandlers(spin, increaseBet, decreaseBet, maxBet) {
    spinButton.addEventListener("click", () => {
        audioManager.playButtonClick();
        gsap.fromTo(spinButton, { scale: 0.95 }, { scale: 1, duration: 0.1 });
        spin();
    });

    betUpButton.addEventListener("click", () => {
        audioManager.playButtonClick();
        increaseBet();
    });

    betDownButton.addEventListener("click", () => {
        audioManager.playButtonClick();
        decreaseBet();
    });

    maxBetButton.addEventListener("click", () => {
        audioManager.playButtonClick();
        maxBet();
    });

    setupPaytableModal();

    // Stop autoplay button
    stopAutoPlayButton.addEventListener("click", () => {
        audioManager.playButtonClick();
        gameState.autoPlayEnabled = false;
        gsap.fromTo(stopAutoPlayButton, { scale: 0.95 }, { scale: 1, duration: 0.1 });
    });

    // Button hover effects
    [spinButton, betUpButton, betDownButton, maxBetButton, musicToggle, muteToggle, stopAutoPlayButton].forEach((button) => {
        button.addEventListener("mouseenter", () => {
            gsap.to(button, { scale: 1.05, duration: 0.2 });
        });
        button.addEventListener("mouseleave", () => {
            gsap.to(button, { scale: 1, duration: 0.2 });
        });
    });

    // Audio control buttons
    musicToggle.addEventListener("click", () => {
        audioManager.playButtonClick();
        const musicEnabled = audioManager.toggleMusic();
        musicToggle.textContent = musicEnabled ? "🎵 MUSIC" : "🔇 MUSIC";
    });

    muteToggle.addEventListener("click", () => {
        audioManager.playButtonClick();
        const isMuted = audioManager.toggleMute();
        muteToggle.textContent = isMuted ? "🔇 SOUND" : "🔊 SOUND";
    });

    document.addEventListener("keydown", (event) => {
        if (event.code === "Escape") {
            closePaytable();

            return;
        }

        if (event.code !== "Space") {
            return;
        }

        const paytableModal = getPaytableModal();
        if (paytableModal && !paytableModal.classList.contains("hidden")) {
            return;
        }

        event.preventDefault();

        audioManager.playButtonClick();
        spin();
    });
}
