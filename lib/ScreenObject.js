class ScreenObject {
    // This object/class is just something that is drawn on the screen.
    // So we don't have to keep copying and pasting the same function to draw
    // a freaking square.
    // And this could help with soon adding camera affects with zooming.
    // And detaching the actual object from the graphics.

    constructor(x, y, w, h, color, scale = true, shadow = false, shadowOffset = [0, 5], shadowBlur = 15, shadowColor = undefined, image = null, tintPower = 0) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.scale = scale;
        this.shadow = shadow;
        this.shadowColor = shadowColor || "#000000AA";
        this.shadowOffset = shadowOffset;
        this.shadowBlur = shadowBlur;
        this.image = image;
        this.tintPower = tintPower;
        this.angle = 0; // degrees
    }

    draw() {
        ctx.fillStyle = this.color;

        if (this.shadow) {
            ctx.shadowColor = this.shadowColor;
            ctx.shadowOffsetX = this.shadowOffset[0];
            ctx.shadowOffsetY = this.shadowOffset[1];
            ctx.shadowBlur = this.shadowBlur;
        } else {
            ctx.shadowColor = "#00000000";
        }

        ctx.save();

        if (this.scale) {
            // ctx.scale here
            ctx.scale(camera.w_scale, camera.h_scale);
            ctx.translate(-camera.x + (WIDTH / 2 * (1 / camera.w_scale)), -camera.y + (HEIGHT / 2 * (1 / camera.h_scale)));
        }

        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.angle * Math.PI / 180);

        if (this.image != null) {
            // draw image
            ctx.drawImage(this.image, this.w / 2 * (-1), this.h / 2 * (-1), this.w, this.h);

            if (this.tintPower != 0) {
                ctx.globalAlpha = this.tintPower;

                ctx.fillRect(this.w / 2 * (-1), this.h / 2 * (-1), this.w, this.h);

                ctx.globalAlpha = 1;
            }
        } else {
            // fill rect
            ctx.fillRect(this.w / 2 * (-1), this.h / 2 * (-1), this.w, this.h);
        }

        ctx.restore();

        // Dead Code
        //if (this.image == null) {
        //    if (this.scale) {
        //        ctx.fillRect(
        //            ((this.x + camera.x) * camera.w_scale) - WIDTH * (camera.w_scale - 1) / 2,
        //            ((this.y + camera.y) * camera.h_scale) - HEIGHT * (camera.h_scale - 1) / 2,
        //            this.w * camera.w_scale,
        //            this.h * camera.h_scale
        //        );
        //    } else {
        //        ctx.fillRect(
        //            this.x,
        //            this.y,
        //            this.w,
        //            this.h
        //        );
        //    }
        //} else {
        //    if (this.scale) {
        //        ctx.drawImage(
        //            this.image,
        //            ((this.x + camera.x) * camera.w_scale) - WIDTH * (camera.w_scale - 1) / 2,
        //            ((this.y + camera.y) * camera.h_scale) - HEIGHT * (camera.h_scale - 1) / 2,
        //            this.w * camera.w_scale,
        //            this.h * camera.h_scale
        //        );

        //        ctx.globalAlpha = this.tintPower || 0;

        //        ctx.fillRect(
        //            ((this.x + camera.x) * camera.w_scale) - WIDTH * (camera.w_scale - 1) / 2,
        //            ((this.y + camera.y) * camera.h_scale) - HEIGHT * (camera.h_scale - 1) / 2,
        //            this.w * camera.w_scale,
        //            this.h * camera.h_scale
        //        );

        //        ctx.globalAlpha = 1.0;
        //    } else {
        //        ctx.drawImage(
        //            this.image,
        //            this.x,
        //            this.y,
        //            this.w,
        //            this.h
        //        );

        //        ctx.globalAlpha = this.tintPower || 0;

        //        ctx.fillRect(
        //            this.x,
        //            this.y,
        //            this.w,
        //            this.h
        //        );

        //        ctx.globalAlpha = 1.0;
        //    }
        //}
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
