/* =========================================================
   DRAW WINNING PAYLINE

   Only the symbols that actually participate in the win
   are connected by the line.
========================================================= */

export function drawPayline(paylineLayer, line, count, SYMBOL_WIDTH, SYMBOL_HEIGHT) {
    paylineLayer.removeChildren();

    const points = line.slice(0, count).map((row, reel) => ({
        x: reel * SYMBOL_WIDTH + SYMBOL_WIDTH / 2,

        y: row * SYMBOL_HEIGHT + SYMBOL_HEIGHT / 2,
    }));

    if (points.length < 2) {
        return;
    }

    const outline = new PIXI.Graphics();

    outline.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        outline.lineTo(points[i].x, points[i].y);
    }

    outline.stroke({
        width: 14,

        color: 0x000000,

        alpha: 0.7,
    });

    const lineGraphic = new PIXI.Graphics();

    lineGraphic.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        lineGraphic.lineTo(points[i].x, points[i].y);
    }

    lineGraphic.stroke({
        width: 7,

        color: 0xffd700,

        alpha: 1,
    });

    paylineLayer.addChild(outline);

    paylineLayer.addChild(lineGraphic);
}
