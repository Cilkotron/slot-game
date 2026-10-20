import { SYMBOL_ICONS } from "../config/symbols.js";

// Cache for loaded textures
const textureCache = {};

async function loadTexture(url) {
    if (textureCache[url]) {
        return textureCache[url];
    }

    const texture = await PIXI.Assets.load(url);
    textureCache[url] = texture;
    return texture;
}

export async function createSymbolView({ reelIndex, slotIndex, symbolWidth, symbolHeight, symbolGap }) {
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

    background.fill(0x1e293b);

    background.stroke({
        width: 4,
        color: 0x475569,
    });

    container.addChild(background);

    // Create sprite container (will be populated when symbol is set)
    const spriteContainer = new PIXI.Container();
    spriteContainer.x = symbolWidth / 2;
    spriteContainer.y = symbolHeight / 2;
    container.addChild(spriteContainer);

    container.symbolSpriteContainer = spriteContainer;

    return container;
}

export async function setSymbol(view, symbolName, symbolWidth, symbolHeight) {
    view.symbolName = symbolName;

    // Clear previous sprite
    view.symbolSpriteContainer.removeChildren();

    // Load and create new sprite
    const texture = await loadTexture(SYMBOL_ICONS[symbolName]);
    const sprite = new PIXI.Sprite(texture);

    // Scale sprite to fit within symbol bounds
    const maxSize = Math.min(symbolWidth, symbolHeight) * 0.7;
    const scale = Math.min(maxSize / texture.width, maxSize / texture.height);

    sprite.scale.set(scale);
    sprite.anchor.set(0.5);

    view.symbolSpriteContainer.addChild(sprite);
}
