class Platform {
    // This is the platform class.
    // We'll have an Array with every single platform so that players
    // Don't go straight through them.
    // The Array will be passed in the player update physics function like
    // this:
    // `player.updatePhysics(platforms);`

    // colors: { top: "#9f1", bottom: "#320" }
    constructor(x, y, w, h, colors, material, unpassable = false) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.colors = colors;
        this.material = material;
        this.unpassable = unpassable;

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
                default:
                    this.screenObjects[i].image = bgImage;
                    this.screenObjects[i].tintPower = 0.75;
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
