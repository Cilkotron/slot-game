import { PAYTABLE } from "../config/paytable.js";

/* =========================================================
   GET PAYLINE SYMBOLS
========================================================= */

export function getLineSymbols(result, line) {
    return line.map((row, reelIndex) => result[reelIndex][row]);
}

/* =========================================================
   EVALUATE PAYLINE
========================================================= */

export function evaluateLine(result, line) {
    const symbols = getLineSymbols(result, line);

    // Scatter does not participate in regular line wins.
    if (symbols[0] === "SCATTER") {
        return null;
    }

    /*
     * Find the first regular symbol.
     * Leading WILD symbols adopt this symbol.
     */
    let target = null;

    for (const symbol of symbols) {
        if (symbol !== "WILD" && symbol !== "SCATTER") {
            target = symbol;
            break;
        }
    }

    /*
     * If the entire sequence starts with WILDs and no
     * regular symbol is found, evaluate it as a WILD win.
     */
    if (!target) {
        target = "WILD";
    }

    let count = 0;

    /*
     * Count consecutive matching symbols from left to right.
     */
    for (const symbol of symbols) {
        if (symbol === target || symbol === "WILD") {
            count++;
        } else {
            break;
        }
    }

    if (count < 3) {
        return null;
    }

    const multiplier = PAYTABLE[target]?.[count];

    if (multiplier === undefined) {
        return null;
    }

    /*
     * If the line begins with WILD symbols, also check
     * whether a pure WILD combination pays more.
     */
    let leadingWilds = 0;

    for (const symbol of symbols) {
        if (symbol === "WILD") {
            leadingWilds++;
        } else {
            break;
        }
    }

    if (
        leadingWilds >= 3 &&
        PAYTABLE.WILD?.[leadingWilds] !== undefined &&
        PAYTABLE.WILD[leadingWilds] > multiplier
    ) {
        return {
            symbol: "WILD",
            count: leadingWilds,
            multiplier: PAYTABLE.WILD[leadingWilds],
        };
    }

    return {
        symbol: target,
        count,
        multiplier,
    };
}
