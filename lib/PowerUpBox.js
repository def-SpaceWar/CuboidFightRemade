class PowerUpBox {
    constructor(x, y) {
        this.powerUps = [
            regeneration(10, 5),
            regeneration(3, 10),
            attackSpeed(18, 8),
            damageBoost(8, 3),
            jumpBoost(15, 1.5),
            speedBoost(12, 2),
            kbDefence(20, 1.5)
        ];

        this.screenObject = new ScreenObject(x, y, 50, 50, "#742", true, true);
        this.x = x;
        this.y = y;
        this.w = 75;
        this.h = 75;

        let i = Math.floor(Math.random() * this.powerUps.length);
        this.chosenPowerUp = this.powerUps[i];
    }

    givePowerUp(player) {
        if (this.done) return;

        player.effectors.push(this.chosenPowerUp);
        this.done = true;
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
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect Regeneration { time: ${time}, level: ${level} }`, "#DD5599")

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

function attackSpeed(time, level) {
    return (player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect AttackSpeed { time: ${time}, level: ${level} }`, "#2255DD")

        player.attackCooldown /= level;

        setTimeout(() => {
            player.attackCooldown *= level;
        }, time * 1000);
    };
}

function damageBoost(time, level) {
    return (player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect DamageBoost { time: ${time}, level: ${level} }`, "#DD2255")

        player.damage *= level;

        setTimeout(() => {
            player.damage /= level;
        }, time * 1000);
    };
}

function jumpBoost(time, level) {
    return (player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect JumpBoost { time: ${time}, level: ${level} }`, "#DD5522")

        player.jumpPower *= level;

        setTimeout(() => {
            player.jumpPower /= level;
        }, time * 1000);
    }
}

function speedBoost(time, level) {
    return (player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect SpeedBoost { time: ${time}, level: ${level} }`, "#99DD55")

        player.moveSpeed *= level;

        setTimeout(() => {
            player.moveSpeed /= level;
        }, time * 1000);
    }
}

function kbDefence(time, level) {
    return (player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect KbDefence { time: ${time}, level: ${level} }`, "#FFDD55")

        player.kbDefence *= level;

        setTimeout(() => {
            player.kbDefence /= level;
        }, time * 1000);
    }
}
