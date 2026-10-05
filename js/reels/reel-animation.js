import { setSymbol } from "./reel.js";

export function recycleReelSymbols({
    reelViews,
    reelIndex,
    gameHeight,
    symbolHeight,
    totalRenderedRows,
    randomSymbolForReel,
}) {
    const reel = reelViews[reelIndex];

    for (const view of reel.views) {
        while (view.y >= gameHeight + symbolHeight) {
            view.y -= totalRenderedRows * symbolHeight;

            setSymbol(view, randomSymbolForReel(reelIndex));
        }
    }
}

export function snapReelToResult({
    reelViews,
    reelIndex,
    finalSymbols,
    bufferRows,
    symbolHeight,
    randomSymbolForReel,
}) {
    const reel = reelViews[reelIndex];

    reel.views.forEach((view, index) => {
        view.y = (index - bufferRows) * symbolHeight;

        setSymbol(view, randomSymbolForReel(reelIndex));
    });

    for (let row = 0; row < finalSymbols.length; row++) {
        const view = reel.views[bufferRows + row];

        view.y = row * symbolHeight;

        setSymbol(view, finalSymbols[row]);
    }
}

export function animateReel({
    reelViews,
    reelIndex,
    finalSymbols,
    duration,
    gameHeight,
    symbolHeight,
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

        function frame(now) {
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

            recycleReelSymbols({
                reelViews,
                reelIndex,
                gameHeight,
                symbolHeight,
                totalRenderedRows,
                randomSymbolForReel,
            });

            if (progress < 1) {
                requestAnimationFrame(frame);
                return;
            }

            snapReelToResult({
                reelViews,
                reelIndex,
                finalSymbols,
                bufferRows,
                symbolHeight,
                randomSymbolForReel,
            });

            const bounceDistance = 10;

            reel.symbolsContainer.y = -bounceDistance;

            const bounceStart = performance.now();

            const bounceDuration = 160;

            function bounce(bounceNow) {
                const p = clamp((bounceNow - bounceStart) / bounceDuration, 0, 1);

                const eased = 1 - Math.pow(1 - p, 3);

                reel.symbolsContainer.y = -bounceDistance * (1 - eased);

                if (p < 1) {
                    requestAnimationFrame(bounce);
                } else {
                    reel.symbolsContainer.y = 0;

                    resolve();
                }
            }

            requestAnimationFrame(bounce);
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
                totalRenderedRows,
                bufferRows,
                randomSymbolForReel,
                clamp,
            })
        );
    }

    await Promise.all(animations);
}
