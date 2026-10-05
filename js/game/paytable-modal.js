import { paytableButton, getPaytableModal, getClosePaytableButton } from "../ui/dom.js";
import { loadPaytableModal } from "../ui/modal-loader.js";

/* =========================================================
   PAYTABLE MODAL
========================================================= */

let modalEventListenersSetup = false;

export async function openPaytable() {
    await loadPaytableModal();
    const paytableModal = getPaytableModal();
    if (paytableModal) {
        if (!modalEventListenersSetup) {
            setupModalEventListeners();
            modalEventListenersSetup = true;
        }
        paytableModal.classList.remove("hidden");
        paytableModal.classList.add("flex");
    }
}

export function closePaytable() {
    const paytableModal = getPaytableModal();
    if (paytableModal) {
        paytableModal.classList.add("hidden");
        paytableModal.classList.remove("flex");
    }
}

function setupModalEventListeners() {
    const closePaytableButton = getClosePaytableButton();
    if (closePaytableButton) {
        closePaytableButton.addEventListener("click", closePaytable);
    }

    const paytableModal = getPaytableModal();
    if (paytableModal) {
        paytableModal.addEventListener("click", (event) => {
            if (event.target === paytableModal) {
                closePaytable();
            }
        });
    }
}

export function setupPaytableModal() {
    paytableButton.addEventListener("click", openPaytable);
}
