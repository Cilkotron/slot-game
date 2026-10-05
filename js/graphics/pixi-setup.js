import { canvasContainer } from "../ui/dom.js";

/* =========================================================
   PIXI SETUP
========================================================= */

export async function initPixi() {
    const app = new PIXI.Application();

    await app.init({
        width: 1,

        height: 1,

        backgroundColor: 0x05070d,

        antialias: true,

        resolution: Math.min(window.devicePixelRatio || 1, 2),

        autoDensity: true,
    });

    canvasContainer.appendChild(app.canvas);

    app.canvas.style.display = "block";

    app.canvas.style.width = "100%";

    app.canvas.style.height = "100%";

    return app;
}

export function createGameLayers(app) {
    const gameStage = new PIXI.Container();

    const reelLayer = new PIXI.Container();

    const paylineLayer = new PIXI.Container();

    app.stage.addChild(gameStage);

    gameStage.addChild(reelLayer);

    gameStage.addChild(paylineLayer);

    return { gameStage, reelLayer, paylineLayer };
}
