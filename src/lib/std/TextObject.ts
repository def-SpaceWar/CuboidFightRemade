import { camera, ctx, HEIGHT, WIDTH } from "../../globals";

export class TextObject {
    // Text object.
    // `font` paramater is used in this format:
    // "18px 'Comic Sans MS'"
    
    x: number;
    y: number;
    w: number;
    h: number;
    text: string;
    color: string;
    font: string;
    scale: boolean;
    lineWidth: number;
    strokeStyle: string;
    angle: number;

    constructor(x: number, y: number, w: number, h: number, text: string, color: string, font: string, scale=false, lineWidth?: number, strokeStyle?: string) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.color = color;
        this.font = font;
        this.scale = scale;
        this.lineWidth = lineWidth || 0;
        this.strokeStyle = strokeStyle || null;
        this.angle = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.font = this.font;
        ctx.lineWidth = this.lineWidth;

        ctx.save();

        if (this.scale) {
            // ctx.scale here
            ctx.scale(camera.w_scale, camera.h_scale);
            ctx.translate(-camera.x + (WIDTH / 2 * (1 / camera.w_scale)), -camera.y + (HEIGHT / 2 * (1 / camera.h_scale)));
        }

        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.angle * Math.PI / 180);

        if (this.strokeStyle != null) {
            ctx.strokeStyle = this.strokeStyle;

            ctx.strokeText(
                this.text,
                this.w / 2 * (-1),
                this.h / 2 * (-1),
                this.w,
                // this.h
            );
        }

        ctx.fillText(
            this.text,
            this.w / 2 * (-1),
            this.h / 2 * (-1),
            this.w,
            // this.h
        );

        ctx.restore();
    }
}
