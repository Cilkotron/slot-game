import { canvasContainer } from "../ui/dom.js";

/* =========================================================
   RESPONSIVE RENDERING
========================================================= */

export function resizeGame(app, gameStage, GAME_WIDTH, GAME_HEIGHT) {
    const width = canvasContainer.clientWidth;

    const height = canvasContainer.clientHeight;

    if (width <= 0 || height <= 0) {
        return;
    }

    app.renderer.resize(width, height);

    const scale = Math.min(
        width / GAME_WIDTH,

        height / GAME_HEIGHT
    );

    gameStage.scale.set(scale);

    gameStage.x = (width - GAME_WIDTH * scale) / 2;

    gameStage.y = (height - GAME_HEIGHT * scale) / 2;
}
