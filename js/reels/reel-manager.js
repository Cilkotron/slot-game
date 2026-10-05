import { createSymbolView, setSymbol } from "./reel.js";

export function createReels({
    reelLayer,
    reelCount,
    totalRenderedRows,
    bufferRows,
    symbolWidth,
    symbolHeight,
    gameHeight,
    randomSymbolForReel,
}) {
    const reelViews = [];

    for (let reelIndex = 0; reelIndex < reelCount; reelIndex++) {
        const reelContainer = new PIXI.Container();

        reelContainer.x = reelIndex * symbolWidth;

        const mask = new PIXI.Graphics();

        mask.rect(0, 0, symbolWidth, gameHeight);

        mask.fill(0xffffff);

        reelContainer.addChild(mask);

        const symbolsContainer = new PIXI.Container();

        symbolsContainer.mask = mask;

        reelContainer.addChild(symbolsContainer);

        const views = [];

        for (let slotIndex = 0; slotIndex < totalRenderedRows; slotIndex++) {
            const view = createSymbolView({
                reelIndex,
                slotIndex,
                symbolWidth,
                symbolHeight,
                symbolGap: 8,
            });

            view.y = (slotIndex - bufferRows) * symbolHeight;

            setSymbol(view, randomSymbolForReel(reelIndex));

            symbolsContainer.addChild(view);

            views.push(view);
        }

        reelViews.push({
            container: reelContainer,
            symbolsContainer,
            views,
        });

        reelLayer.addChild(reelContainer);
    }

    return reelViews;
}

export function getVisibleView(reelViews, reelIndex, row, bufferRows) {
    return reelViews[reelIndex].views[bufferRows + row];
}
