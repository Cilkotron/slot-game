import { setSymbol } from "./reel.js";
import gsap from "gsap";

export async function recycleReelSymbols({
    reelViews,
    reelIndex,
    gameHeight,
    symbolHeight,
    symbolWidth,
    totalRenderedRows,
    randomSymbolForReel,
}) {
    const reel = reelViews[reelIndex];

    for (const view of reel.views) {
        while (view.y >= gameHeight + symbolHeight) {
            view.y -= totalRenderedRows * symbolHeight;

            await setSymbol(view, randomSymbolForReel(reelIndex), symbolWidth, symbolHeight);
        }
    }
}

export async function snapReelToResult({
    reelViews,
    reelIndex,
    finalSymbols,
    bufferRows,
    symbolHeight,
    symbolWidth,
    randomSymbolForReel,
}) {
    const reel = reelViews[reelIndex];

    for (const view of reel.views) {
        view.y = (view.slotIndex - bufferRows) * symbolHeight;

        await setSymbol(view, randomSymbolForReel(reelIndex), symbolWidth, symbolHeight);
    }

    for (let row = 0; row < finalSymbols.length; row++) {
        const view = reel.views[bufferRows + row];

        view.y = row * symbolHeight;

        await setSymbol(view, finalSymbols[row], symbolWidth, symbolHeight);
    }
}

export function animateReel({
    reelViews,
    reelIndex,
    finalSymbols,
    duration,
    gameHeight,
    symbolHeight,
    symbolWidth,
    totalRenderedRows,
    bufferRows,
    randomSymbolForReel,
    clamp,
}) {
    return new Promise((resolve) => {
        const reel = reelViews[reelIndex];

        const startTime = performance.now();

        let previousTime = startTime;

        const maxSpeed = 2.1 + reelIndex * 0.08;

        async function frame(now) {
            const elapsed = now - startTime;

            const delta = Math.min(now - previousTime, 32);

            previousTime = now;

            const progress = clamp(elapsed / duration, 0, 1);

            let speedFactor;

            if (progress < 0.15) {
                speedFactor = progress / 0.15;
            } else if (progress < 0.72) {
                speedFactor = 1;
            } else {
                const stopProgress = (progress - 0.72) / 0.28;

                speedFactor = 1 - stopProgress;

                speedFactor *= speedFactor;
            }

            const movement = maxSpeed * delta * speedFactor;

            for (const view of reel.views) {
                view.y += movement;
            }

            await recycleReelSymbols({
                reelViews,
                reelIndex,
                gameHeight,
                symbolHeight,
                symbolWidth,
                totalRenderedRows,
                randomSymbolForReel,
            });

            if (progress < 1) {
                requestAnimationFrame(frame);
                return;
            }

            await snapReelToResult({
                reelViews,
                reelIndex,
                finalSymbols,
                bufferRows,
                symbolHeight,
                symbolWidth,
                randomSymbolForReel,
            });

            // GSAP bounce animation
            reel.symbolsContainer.y = -10;
            gsap.to(reel.symbolsContainer, {
                y: 0,
                duration: 0.16,
                ease: "power3.out",
                onComplete: resolve,
            });
        }

        requestAnimationFrame(frame);
    });
}

export async function animateReels({
    reelViews,
    result,
    reelCount,
    gameHeight,
    symbolHeight,
    symbolWidth,
    totalRenderedRows,
    bufferRows,
    randomSymbolForReel,
    clamp,
}) {
    const animations = [];

    for (let reelIndex = 0; reelIndex < reelCount; reelIndex++) {
        animations.push(
            animateReel({
                reelViews,
                reelIndex,
                finalSymbols: result[reelIndex],
                duration: 800 + reelIndex * 180,
                gameHeight,
                symbolHeight,
                symbolWidth,
                totalRenderedRows,
                bufferRows,
                randomSymbolForReel,
                clamp,
            })
        );
    }

    await Promise.all(animations);
}
