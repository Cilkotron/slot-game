import { paytableButton, getPaytableModal, getClosePaytableButton } from "../ui/dom.js";
import { loadPaytableModal } from "../ui/modal-loader.js";
import gsap from "gsap";

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

        const modalContent = paytableModal.querySelector("div");
        gsap.fromTo(
            modalContent,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
    }
}

export function closePaytable() {
    const paytableModal = getPaytableModal();
    if (paytableModal) {
        const modalContent = paytableModal.querySelector("div");
        gsap.to(modalContent, {
            scale: 0.8,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
                paytableModal.classList.add("hidden");
                paytableModal.classList.remove("flex");
            },
        });
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
