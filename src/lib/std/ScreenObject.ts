import { ctx, camera, WIDTH, HEIGHT } from "../../globals";

export class ScreenObject {
  static ldm: boolean = false;

  // This object/class is just something that is drawn on the screen.
  // So we don't have to keep copying and pasting the same function to draw
  // a freaking square.
  // And this could help with soon adding camera affects with zooming.
  // And detaching the actual object from the graphics.
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  scale: boolean;
  shadow: boolean;
  shadowColor: string;
  shadowOffset: number[];
  shadowBlur: number;
  image: HTMLImageElement;
  tintPower: number;
  angle: number;

  constructor(x: number, y: number, w: number, h: number, color: string, scale?: boolean, shadow?: boolean, shadowOffset?: number[], shadowBlur?: number, shadowColor?: string, image?: HTMLImageElement, tintPower?: number) {
    ScreenObject.ldm = (localStorage.getItem("ldm") == "0") ? false : true;

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.scale = scale;
    if (scale == undefined) this.scale = true;
    this.shadow = shadow || false;
    if (ScreenObject.ldm) this.shadow = false;
    this.shadowColor = shadowColor || "#000000AA";
    this.shadowOffset = shadowOffset || [0, 4];
    this.shadowBlur = shadowBlur || 5;
    this.image = image;
    this.tintPower = tintPower || 0;
    this.angle = 0; // degrees
  }

  draw() {
    ctx.save();
    ctx.fillStyle = this.color;

    if (this.shadow) {
      ctx.shadowColor = this.shadowColor;
      ctx.shadowOffsetX = this.shadowOffset[0] * (this.scale ? camera.w_scale : 1);
      ctx.shadowOffsetY = this.shadowOffset[1] * (this.scale ? camera.h_scale : 1);
      //ctx.shadowBlur = this.shadowBlur;
    } else {
      ctx.shadowColor = "#00000000";
    }

    if (this.scale) {
      // ctx.scale here
      ctx.scale(camera.w_scale, camera.h_scale);
      ctx.translate(
        -camera.x + (WIDTH / 2 * (1 / camera.w_scale)) + this.x + this.w / 2,
        -camera.y + (HEIGHT / 2 * (1 / camera.h_scale)) + this.y + this.h / 2
      );
    } else {
      ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    }

    if (this.angle % 360 != 0) ctx.rotate(this.angle * Math.PI / 180);

    if (this.image != null) {
      // draw image
      ctx.drawImage(this.image, Math.floor(this.w / 2 * (-1)), Math.floor(this.h / 2 * (-1)), Math.floor(this.w), Math.floor(this.h));
    } else {
      // fill rect
      ctx.fillRect(this.w / 2 * (-1), this.h / 2 * (-1), this.w, this.h);
    }


    if (this.tintPower != 0) {
      ctx.shadowColor = "#00000000";
      if (ScreenObject.ldm) {
        ctx.globalAlpha = this.tintPower;
        ctx.fillRect(this.w / 2 * (-1), this.h / 2 * (-1), this.w, this.h);
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation = "hard-light";
        ctx.fillRect(this.w / 2 * (-1), this.h / 2 * (-1), this.w, this.h);
        ctx.globalCompositeOperation = "source-over";
      }
    }
    ctx.restore();
  }

  isCollided(otherObj: ScreenObject) {
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
