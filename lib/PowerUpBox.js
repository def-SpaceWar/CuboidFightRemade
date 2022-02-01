class PowerUpBox {
    constructor(x, y) {
        this.powerUps = [regeneration(20, 5), fasterAttack(10, 4), moreDamage(8, 5), regeneration(3, 20)];
        this.screenObject = new ScreenObject(x, y, 50, 50, "#742");
        this.x = x;
        this.y = y;
        this.w = 75;
        this.h = 75;
    }

    givePowerUp(player) {
        if (this.done) return;
        let chosenPowerUp = this.powerUps[Math.floor(Math.random() * this.powerUps.length)];
        player.effectors.push(chosenPowerUp);
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

// ----------- Power Ups

function regeneration(time, level) {
    // time * level = amount_of_health_possible_gain
    return (player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect Regeneration { time: ${time}, level: ${level} }`, "#FF9900")

        let playerHealth = player.health;
        let timeStep = 1; // amount of time in seconds before regening again.
        let step = 0;

        let regen = setInterval(() => {
            step++;
            if (step >= time) clearInterval(regen);
            playerHealth.modHealth(level);
        }, timeStep * 1000);
    };
}

function fasterAttack(time, level) {
    return (player) => {
        if (player.hasFasterAttack) return;

        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect AttackSpeed { time: ${time}, level: ${level} }`, "#FF9900")

        const oldCoolDown = player.attackCoolDown;
        player.attackCoolDown /= level;
        player.hasFasterAttack = true;

        setTimeout(() => {
            player.attackCoolDown = oldCoolDown;
            player.hasFasterAttack = false;
        }, time * 1000);
    };
}

function moreDamage(time, level) {
    return (player) => {
        if (player.hasMoreDamage) return;

        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect DamageBoost { time: ${time}, level: ${level} }`, "#FF9900")

        const oldDamage = player.damage;
        player.damage *= level;
        player.hasMoreDamage = true;

        setTimeout(() => {
            player.damage = oldDamage;
            player.hasMoreDamage = false;
        }, time * 1000);
    };
}
