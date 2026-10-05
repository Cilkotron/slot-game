/* =========================================================
   BACKGROUND
========================================================= */

export function createBackground(reelLayer, gameWidth, gameHeight) {
    const background = new PIXI.Graphics();

    background.rect(0, 0, gameWidth, gameHeight);

    background.fill(0x080b12);

    reelLayer.addChild(background);
}
