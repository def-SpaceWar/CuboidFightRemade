class Platform {
    // This is the platform class.
    // We'll have an Array with every single platform so that players
    // Don't go straight through them.
    // The Array will be passed in the player update physics function like
    // this:
    // `player.updatePhysics(platforms);`

    // colors: { top: "#9f1", bottom: "#320" }
    constructor(x, y, w, h, colors) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.colors = colors;
        this.id = Math.random();

        this.screenObjects = [
            new ScreenObject(x, y, w, h / 2, colors.top),
            new ScreenObject(x, y + h / 2, w, h / 2, colors.bottom),
        ];
    }

    draw() {
        for (let i = 0; i < this.screenObjects.length; i++) {
            this.screenObjects[i].draw();
        }
    }

    isCollided(player) {
        if (player.x >= this.x && player.x <= this.x + this.w) {
            if (player.y >= this.y && player.y <= this.y + this.h) {
                return true;
            } else if (player.y + player.h >= this.y && player.y + player.h <= this.y + this.h) {
                return true;
            }
        } else if (player.x + player.w >= this.x && player.x + player.w <= this.x + this.w) {
            if (player.y >= this.y && player.y <= this.y + this.h) {
                return true;
            } else if (player.y + player.h >= this.y && player.y + player.h <= this.y + this.h) {
                return true;
            }
        }

        return false;
    }
}
