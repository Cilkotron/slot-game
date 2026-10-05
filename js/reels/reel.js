import { SYMBOL_ICONS } from "../config/symbols.js";

export function createSymbolView({ reelIndex, slotIndex, symbolWidth, symbolHeight, symbolGap }) {
    const container = new PIXI.Container();

    container.reelIndex = reelIndex;
    container.slotIndex = slotIndex;
    container.symbolName = null;

    const background = new PIXI.Graphics();

    background.roundRect(
        symbolGap / 2,
        symbolGap / 2,
        symbolWidth - symbolGap,
        symbolHeight - symbolGap,
        18
    );

    background.fill(0xf3f4f6);

    background.stroke({
        width: 4,
        color: 0x3f3f46,
    });

    container.addChild(background);

    const text = new PIXI.Text({
        text: "",
        style: {
            fontFamily: "Arial, sans-serif",
            fontSize: 86,
            align: "center",
        },
    });

    text.anchor.set(0.5);

    text.x = symbolWidth / 2;
    text.y = symbolHeight / 2;

    container.addChild(text);

    container.symbolText = text;

    return container;
}

export function setSymbol(view, symbolName) {
    view.symbolName = symbolName;
    view.symbolText.text = SYMBOL_ICONS[symbolName];
}
