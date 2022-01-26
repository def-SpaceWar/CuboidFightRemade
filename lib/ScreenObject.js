class ScreenObject {
    // This object/class is just something that is drawn on the screen.
    // So we don't have to keep copying and pasting the same function to draw
    // a freaking square.
    // And this could help with soon adding camera affects with zooming.
    // And detaching the actual object from the graphics.

    constructor(x, y, w, h, color, scale = true, glow = false, glowOffset = [0, 0], glowBlur = 20, glowColor = undefined) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.scale = scale;
        this.glow = glow;
        this.glowColor = glowColor || this.color;
        this.glowOffset = glowOffset;
        this.glowBlur = glowBlur;
    }

    draw() {
        ctx.fillStyle = this.color;

        if (this.glow) {
            ctx.shadowColor = this.glowColor;
            ctx.shadowOffsetX = this.glowOffset[0];
            ctx.shadowOffsetY = this.glowOffset[1];
            ctx.shadowBlur = this.glowBlur * camera.w_scale;
        } else {
            ctx.shadowColor = "#00000000";
        }

        if (this.scale) {
            ctx.fillRect(
                ((this.x + camera.x) * camera.w_scale) - WIDTH * (camera.w_scale - 1) / 2,
                ((this.y + camera.y) * camera.h_scale) - HEIGHT * (camera.h_scale - 1) / 2,
                this.w * camera.w_scale,
                this.h * camera.h_scale
            );
        } else {
            ctx.fillRect(
                this.x,
                this.y,
                this.w,
                this.h
            );
        }
    }
}
