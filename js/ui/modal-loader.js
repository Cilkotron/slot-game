/* =========================================================
   MODAL LOADER
========================================================= */

let modalLoaded = false;

export async function loadPaytableModal() {
    if (modalLoaded) {
        return;
    }

    try {
        const response = await fetch("./templates/paytable-modal.html");
        const html = await response.text();
        document.body.insertAdjacentHTML("beforeend", html);
        modalLoaded = true;
    } catch (error) {
        console.error("Failed to load paytable modal:", error);
    }
}
