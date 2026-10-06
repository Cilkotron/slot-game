import {
    spinButton,
    betUpButton,
    betDownButton,
    maxBetButton,
    musicToggle,
    muteToggle,
    getPaytableModal,
} from "../ui/dom.js";
import { setupPaytableModal, closePaytable } from "./paytable-modal.js";
import { audioManager } from "../audio/audio-manager.js";

/* =========================================================
   EVENT HANDLERS
========================================================= */

export function setupEventHandlers(spin, increaseBet, decreaseBet, maxBet) {
    spinButton.addEventListener("click", () => {
        audioManager.playButtonClick();
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
