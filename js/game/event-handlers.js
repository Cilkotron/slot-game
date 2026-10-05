import {
    spinButton,
    betUpButton,
    betDownButton,
    maxBetButton,
    getPaytableModal,
} from "../ui/dom.js";
import { setupPaytableModal, closePaytable } from "./paytable-modal.js";

/* =========================================================
   EVENT HANDLERS
========================================================= */

export function setupEventHandlers(spin, increaseBet, decreaseBet, maxBet) {
    spinButton.addEventListener("click", spin);

    betUpButton.addEventListener("click", increaseBet);

    betDownButton.addEventListener("click", decreaseBet);

    maxBetButton.addEventListener("click", maxBet);

    setupPaytableModal();

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

        spin();
    });
}
