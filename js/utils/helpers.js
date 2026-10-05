/* =========================================================
   GENERAL HELPERS
========================================================= */

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/* =========================================================
   MONEY HELPERS
========================================================= */

export function roundMoney(value) {
    return Math.round(value * 100) / 100;
}

export function formatMoney(value) {
    const rounded = roundMoney(value);

    if (Number.isInteger(rounded)) {
        return String(rounded);
    }

    return rounded.toFixed(2);
}
