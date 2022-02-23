class Platform {
    // This is the platform class.
    // We'll have an Array with every single platform so that players
    // Don't go straight through them.
    // The Array will be passed in the player update physics function like
    // this:
    // `player.updatePhysics(platforms);`

    // colors: { top: "#9f1", bottom: "#320" }
    constructor(x, y, w, h, colors, unpassable = false) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.colors = colors;
        this.id = Math.random();
        this.unpassable = unpassable;

        this.screenObjects = [
            new ScreenObject(x, y, w, h * 0.667, colors.top),
            new ScreenObject(x, y - h * 0.5, w, h * 0.5, colors.top),
            new ScreenObject(x, y + h * 0.667, w, h / 3, colors.bottom, true, true),
        ];
    }

    draw() {
        for (let i = 0; i < this.screenObjects.length; i++) {
            this.screenObjects[i].draw();
        }
    }
}
