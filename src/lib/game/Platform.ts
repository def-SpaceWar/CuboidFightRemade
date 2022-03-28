import { bgOrig, ditherTexture, grassTexture } from "../../globals";
import { ScreenObject } from "../std/ScreenObject";

export type PlatformColors = {
    top: string;
    bottom: string;
};

export type Material = "grass" | "stone" | "deadly";

export class Platform {
    // This is the platform class.
    // We'll have an Array with every single platform so that players
    // Don't go straight through them.
    // The Array will be passed in the player update physics function like
    // this:
    // `player.updatePhysics(platforms);`
    // colors: { top: "#9f1", bottom: "#320" }
    
    x: number;
    y: number;
    w: number;
    h: number;
    colors: PlatformColors;
    material: Material;
    unpassable: boolean;
    screenObjects: ScreenObject[];
    damaging: boolean;

    constructor(x: number, y: number, w: number, h: number, colors: PlatformColors, material: Material, unpassable = false) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.colors = colors;
        this.material = material;
        this.unpassable = unpassable;
        this.damaging = false;

        this.screenObjects = [
            new ScreenObject(x, y + 0.5, w, h * 0.5, colors.bottom),
            new ScreenObject(x, y - 0.25 * h, w, h, colors.bottom),
            new ScreenObject(x, y - h * 0.5, w, h, colors.top),
        ];

        for (let i = 0; i < this.screenObjects.length; i++) {
            switch (this.material) {
                case "grass":
                    this.screenObjects[i].image = grassTexture;
                    this.screenObjects[i].tintPower = 0.8;
                    break;
                case "stone":
                    this.screenObjects[i].image = ditherTexture;
                    this.screenObjects[i].tintPower = 0.8;
                    break;
                case "deadly":
                    this.screenObjects[i].image = ditherTexture;
                    this.screenObjects[i].tintPower = 0.8;
                    this.screenObjects[2].tintPower = 0;
                    break;
                default:
                    this.screenObjects[i].image = bgOrig;
                    this.screenObjects[i].tintPower = 0.5;
                    break;
            }
        }
    }

    draw() {
        for (let i = 0; i < this.screenObjects.length; i++) {
            this.screenObjects[i].draw();
        }
    }
}
