class PowerUpBox {
    constructor(x, y) {
        this.powerUps = [regeneration(10, 5), regeneration(7, 10)];
        this.screenObject = new ScreenObject(x, y, 50, 50, "#742");
        this.x = x;
        this.y = y;
        this.w = 50;
        this.h = 50;
    }

    givePowerUp(player) {
        if (this.done) return;
        let chosenPowerUp = this.powerUps[Math.floor(Math.random() * this.powerUps.length)];
        player.health.effectors.push(chosenPowerUp);
        this.done = true;
    }

    isCollided(player) {
        if (this.done) return false;

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

    draw() {
        if (this.done) return;

        this.screenObject.draw();
    }
}
