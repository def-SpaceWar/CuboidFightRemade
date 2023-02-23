import { GameConsole, powerUpBoxTexture1 } from "../../globals";
import { Player } from "../player/Player";
import { ScreenObject } from "../std/ScreenObject";

export class PowerUpBox {
    powerUps: ((player: Player) => void)[];

    screenObject: ScreenObject;

    x: number;
    y: number;
    w: number;
    h: number;

    chosenPowerUp: (player: Player) => void;
    done: boolean;

    constructor(x: number, y: number) {
        this.powerUps = [
            regeneration(10, 5),
            regeneration(4, 10),
            abilitySpeed(18, 3),
            damageBoost(8, 3),
            jumpBoost(15, 1.5),
            speedBoost(12, 2),
            kbBoost(8, 3),
            kbDefence(20, 5),
            damageDefence(10, 1.5),
            healBoost(20, 2),
            bloodlust(30)
        ];

        this.screenObject = new ScreenObject(x, y, 80, 80, "#742", true, true);
        this.screenObject.image = powerUpBoxTexture1;
        this.screenObject.tintPower = 0;

        this.x = x;
        this.y = y;
        this.w = 75;
        this.h = 75;

        let i = Math.floor(Math.random() * this.powerUps.length);
        this.chosenPowerUp = this.powerUps[i];
        this.done = false;
    }

    givePowerUp(player: Player) {
        if (this.done) return;

        player.effectors.push(this.chosenPowerUp);
        this.done = true;
    }

    updatePhysics() {
        this.screenObject.angle += 1;
    }

    draw() {
        if (this.done) return;

        this.screenObject.draw();
    }
}

// ----------- Power Ups

export function regeneration(time: number, level: number) {
    // time * level = amount_of_health_possible_gain
    return (player: Player) => {
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

export function abilitySpeed(time: number, level: number) {
    return (player: Player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect AbilitySpeed { time: ${time}, level: ${level} }`, "#2255DD")

        player.attackCooldown /= level;

        setTimeout(() => {
            player.attackCooldown *= level;
        }, time * 1000);
    };
}

export function damageBoost(time: number, level: number) {
    return (player: Player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect DamageBoost { time: ${time}, level: ${level} }`, "#DD2255")

        player.damage *= level;

        setTimeout(() => {
            player.damage /= level;
        }, time * 1000);
    };
}

export function jumpBoost(time: number, level: number) {
    return (player: Player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect JumpBoost { time: ${time}, level: ${level} }`, "#DD5522")

        player.jumpPower *= level;

        setTimeout(() => {
            player.jumpPower /= level;
        }, time * 1000);
    }
}

export function speedBoost(time: number, level: number) {
    return (player: Player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect SpeedBoost { time: ${time}, level: ${level} }`, "#99DD55")

        player.speed *= level;

        setTimeout(() => {
            player.speed /= level;
        }, time * 1000);
    }
}

export function kbBoost(time: number, level: number) {
    return (player: Player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect KbBoost { time: ${time}, level: ${level} }`, "#99DDFF")

        player.kbMult *= level;

        setTimeout(() => {
            player.kbMult /= level;
        }, time * 1000);
    }
}

export function kbDefence(time: number, level: number) {
    return (player: Player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect KbDefence { time: ${time}, level: ${level} }`, "#FFDD55")

        player.kbDefence *= level;

        setTimeout(() => {
            player.kbDefence /= level;
        }, time * 1000);
    }
}

export function damageDefence(time: number, level: number) {
    return (player: Player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect DamageDefence { time: ${time}, level: ${level} }`, "#FF99DD")

        player.defenceDivisor /= level;

        setTimeout(() => {
            player.defenceDivisor *= level;
        }, time * 1000);
    }
}

export function healBoost(time: number, level: number) {
    return (player: Player) => {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect HealBoost { time: ${time}, level: ${level} }`, "#55FF99")

        player.healMult *= level;

        setTimeout(() => {
            player.healMult /= level;
        }, time * 1000);
    }
}

export function bloodlust(time: number) {
    return function(player: Player) {
        GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect Bloodlust { time: ${time} }`, "#992222");

        player.comboCooldownAmount *= 2;
        player.speed *= 1.5;
        player.jumpPower *= 1.5;
        player.kbDefence *= 1.5;
        player.damage *= 1.25;

        setTimeout(() => {
            player.comboCooldownAmount /= 2;
            player.speed /= 1.5;
            player.jumpPower /= 1.5;
            player.kbDefence /= 1.5;
            player.damage /= 1.25;
        }, time * 1000);
    }
}
