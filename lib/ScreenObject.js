class ScreenObject {
    // This object/class is just something that is drawn on the screen.
    // So we don't have to keep copying and pasting the same function to draw
    // a freaking square.
    // And this could help with soon adding camera affects with zooming.
    // And detaching the actual object from the graphics.

    constructor(x, y, w, h, color, scale = true, shadow = false, shadowOffset = [0, 5], shadowBlur = 15, shadowColor = undefined, image = null, tintPower = null) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.scale = scale;
        this.shadow = shadow;
        this.shadowColor = shadowColor || "#00000099";
        this.shadowOffset = shadowOffset;
        this.shadowBlur = shadowBlur;
        this.image = image;
        this.tintPower = tintPower;
    }

    draw() {
        ctx.fillStyle = this.color;

        if (this.shadow) {
            ctx.shadowColor = this.shadowColor;
            ctx.shadowOffsetX = this.shadowOffset[0];
            ctx.shadowOffsetY = this.shadowOffset[1];
            ctx.shadowBlur = this.shadowBlur * camera.w_scale;
        } else {
            ctx.shadowColor = "#00000000";
        }

        if (this.image == null) {
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
        } else {
            if (this.scale) {
                ctx.drawImage(
                    this.image,
                    ((this.x + camera.x) * camera.w_scale) - WIDTH * (camera.w_scale - 1) / 2,
                    ((this.y + camera.y) * camera.h_scale) - HEIGHT * (camera.h_scale - 1) / 2,
                    this.w * camera.w_scale,
                    this.h * camera.h_scale
                );

                ctx.globalCompositeOperation = "luminosity";
                ctx.globalAlpha = this.tintPower || 0;

                ctx.fillRect(
                    ((this.x + camera.x) * camera.w_scale) - WIDTH * (camera.w_scale - 1) / 2,
                    ((this.y + camera.y) * camera.h_scale) - HEIGHT * (camera.h_scale - 1) / 2,
                    this.w * camera.w_scale,
                    this.h * camera.h_scale
                );

                ctx.globalCompositeOperation = "color";

                ctx.fillRect(
                    ((this.x + camera.x) * camera.w_scale) - WIDTH * (camera.w_scale - 1) / 2,
                    ((this.y + camera.y) * camera.h_scale) - HEIGHT * (camera.h_scale - 1) / 2,
                    this.w * camera.w_scale,
                    this.h * camera.h_scale
                );

                ctx.globalAlpha = 1.0;
                ctx.globalCompositeOperation = "source-over";
            } else {
                ctx.drawImage(
                    this.image,
                    this.x,
                    this.y,
                    this.w,
                    this.h
                );

                ctx.globalCompositeOperation = "color";
                ctx.globalAlpha = this.tintPower || 0;

                ctx.fillRect(
                    this.x,
                    this.y,
                    this.w,
                    this.h
                );

                ctx.globalAlpha = 1.0;
                ctx.globalCompositeOperation = "source-over";
            }
        }
    }

    isCollided(otherObj) {
        if (otherObj.x >= this.x && otherObj.x <= this.x + this.w) {
            if (otherObj.y >= this.y && otherObj.y <= this.y + this.h) {
                return true;
            } else if (otherObj.y + otherObj.h >= this.y && otherObj.y + otherObj.h <= this.y + this.h) {
                return true;
            }
        } else if (otherObj.x + otherObj.w >= this.x && otherObj.x + otherObj.w <= this.x + this.w) {
            if (otherObj.y >= this.y && otherObj.y <= this.y + this.h) {
                return true;
            } else if (otherObj.y + otherObj.h >= this.y && otherObj.y + otherObj.h <= this.y + this.h) {
                return true;
            }
        }

        return false;
    }
}
