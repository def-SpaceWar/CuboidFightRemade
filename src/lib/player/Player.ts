import { WIDTH, HEIGHT, GameConsole } from "../../globals";
import { Accessorie } from "./Accessorie";
import { Gamemode } from "../game/Gamemode";
import { Platform } from "../game/Platform";
import { abilitySpeed, bloodlust, damageBoost, damageDefence, healBoost, jumpBoost, kbBoost, kbDefence, PowerUpBox, regeneration, speedBoost } from "../game/PowerUpBox";
import { ScreenObject } from "../std/ScreenObject";
import { TextObject } from "../std/TextObject";
import { ComboCounter } from "./ComboCounter";
import { VampireWing } from "./VampireWing";

type Controls = {
  left: string,
  right: string,
  up: string,
  down: string,
  attack: string,
  special: string
};

export class Player {
  // This is the player.
  // It will have 2 screen objects.
  // One for the health bar, and one for the player itself.
  static playerCounter = 0;
  static teamCounter = 4;

  playerNum: number;
  lastPlayerHit: Player;
  killCount: number;
  lives: number;
  deaths: number;
  team: number;

  x: number;
  y: number;
  w: number;
  h: number;

  color: string;
  inactiveColor: string;
  controls: Controls;

  effectors: ((player: Player) => void)[];
  accessoriesUnder: Accessorie[];
  accessoriesOver: Accessorie[];
  respawnPoint: number[];

  xVelocity: number;
  yVelocity: number;
  otherPlayers: Player[];
  speed: number;
  moving: boolean;
  moveDir: number;
  jumpPower: number;
  jumpCounter: number;
  maxJumps: number;

  health: PlayerHealth;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  specialCooldownMult: number;
  showCooldown: boolean;
  attackable: boolean;
  kbMult: number;
  kbDefence: number;
  defenceDivisor: number;
  healMult: number;
  combo: number;
  comboCooldownAmount: number;

  forces: { x: number; y: number; }[];

  groundPounding: boolean;
  gravity: number;
  terminalVelocity: number;
  drag: number;
  grounded: boolean;
  isPhasing: boolean;

  class: string;

  screenObject: any;
  attkCooldownObjs: ScreenObject[];

  constructor(x: number, y: number, w: number, h: number, colors: string[], controls: Controls) {
    Player.playerCounter++;
    Player.teamCounter++;
    this.playerNum = Player.playerCounter;
    this.lastPlayerHit = null;
    this.killCount = 0;
    this.lives = 3;
    this.deaths = 0;
    this.team = Player.teamCounter;

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = colors[0];
    this.inactiveColor = colors[1];
    this.controls = controls;
    // An array with a bunch of funciotns that have no return type. Useful for powerups/regen
    this.effectors = [];
    this.accessoriesUnder = [];
    this.accessoriesOver = [
      new ComboCounter(this, ["#333", this.inactiveColor, this.color])
    ];
    this.respawnPoint = [0, 0];

    this.xVelocity = 0;
    this.yVelocity = 0;
    this.otherPlayers = [];
    this.speed = 6;
    this.moving = false;
    this.moveDir = 0;
    this.jumpPower = 50;
    this.jumpCounter = 0;
    this.maxJumps = 2;

    this.health = new PlayerHealth(100, 100, this.color, this.inactiveColor, "#333333DD", this);
    this.damage = 4;
    this.attackRange = 100;
    this.attackCooldown = 2;
    this.specialCooldownMult = 5;
    this.showCooldown = false;
    this.attackable = true;
    this.kbMult = 1;
    this.kbDefence = 1;
    this.defenceDivisor = 1;
    this.healMult = 1;
    this.combo = 0;
    this.comboCooldownAmount = 250;

    this.forces = [{
      x: 0,
      y: 0
    }, // Movement
    {
      x: 0,
      y: 0
    }, // Attacking
    {
      x: 0,
      y: 0
    }, // Jumping
    {
      x: 0,
      y: 0
    }, // Ground Pound
    {
      x: 0,
      y: 0
    }, // Gravity
    ];

    this.groundPounding = false;
    this.gravity = 0.2;
    this.terminalVelocity = -30;
    this.drag = 0.8;
    this.grounded = false;
    this.isPhasing = false;

    this.class = undefined;
    this.loadSettings();

    this.screenObject = new ScreenObject(
      this.x,
      this.y,
      this.w,
      this.h,
      this.color,
      true,
      true
    );

    this.attkCooldownObjs = [
      // an object that's darker and static length.
      new ScreenObject(this.x, this.y - 30, this.w, 10, this.inactiveColor),
      // an object that's variable length
      new ScreenObject(this.x, this.y - 30, this.w, 10, this.color)
    ];
  }

  reload() {
    // An array with a bunch of funciotns that have no return type. Useful for powerups/regen
    this.effectors = [];
    this.accessoriesUnder = [];
    this.accessoriesOver = [
      new ComboCounter(this, ["#333", this.inactiveColor, this.color])
    ];

    this.speed = 6;
    this.jumpPower = 50;
    this.jumpCounter = 0;
    this.maxJumps = 2;

    this.health = new PlayerHealth(100, 100, this.color, this.inactiveColor, "#333333DD", this);
    this.damage = 4;
    this.attackRange = 100;
    this.kbMult = 1;
    this.kbDefence = 1;
    this.defenceDivisor = 1;
    this.healMult = 1;
    this.attackCooldown = 2;
    this.showCooldown = false;
    this.attackable = true;
    this.combo = 0;
    this.comboCooldownAmount = 250;

    this.loadClass();

    this.screenObject = new ScreenObject(
      this.x,
      this.y,
      this.w,
      this.h,
      this.color,
      true,
      true,
    );

    this.attkCooldownObjs = [
      // an object that's darker and static length.
      new ScreenObject(this.x, this.y - 30, this.w, 10, this.inactiveColor),
      // an object that's variable length
      new ScreenObject(this.x, this.y - 30, this.w, 10, this.color)
    ];
  }

  loadSettings() {
    // Load settings for the player.

    // controls
    if (localStorage.getItem(`player${this.playerNum}left`) != null) this.controls.left = localStorage.getItem(`player${this.playerNum}left`);
    if (localStorage.getItem(`player${this.playerNum}up`) != null) this.controls.up = localStorage.getItem(`player${this.playerNum}up`);
    if (localStorage.getItem(`player${this.playerNum}down`) != null) this.controls.down = localStorage.getItem(`player${this.playerNum}down`);
    if (localStorage.getItem(`player${this.playerNum}right`) != null) this.controls.right = localStorage.getItem(`player${this.playerNum}right`);
    if (localStorage.getItem(`player${this.playerNum}attack`) != null) this.controls.attack = localStorage.getItem(`player${this.playerNum}attack`);
    if (localStorage.getItem(`player${this.playerNum}special`) != null) this.controls.special = localStorage.getItem(`player${this.playerNum}special`);

    this.lives = parseInt(localStorage.getItem("stocklives")) || this.lives;

    // classes
    this.class = localStorage.getItem(`player${this.playerNum}class`) || "Default";
    this.loadClass();
  }

  loadClass() {
    switch (this.class) {
      case "Berserk":
        this.speed /= 1.2;
        this.jumpPower *= 1.2;
        this.maxJumps = 1;
        this.damage *= 1.1;
        this.attackRange *= 1.1;
        this.attackCooldown *= 1.5;
        this.kbMult = 1.1;
        this.kbDefence = 1.3;
        this.comboCooldownAmount = 400;
        this.health.health = 75;
        this.health._health = 75;
        this.health.maxHealth = 75;
        break;
      case "Tank":
        this.speed /= 1.5;
        this.attackCooldown *= 1.6;
        this.specialCooldownMult = 3;
        this.damage *= 1.1;
        this.comboCooldownAmount = 200;
        this.jumpPower /= 1.5;
        this.health.health = 200;
        this.health._health = 200;
        this.health.maxHealth = 200;
        this.kbMult = 0.5;
        this.kbDefence = 2;
        break;
      case "Ninja":
        this.speed *= 1.5;
        this.attackCooldown /= 1.5;
        this.specialCooldownMult = 10;
        this.damage /= 1.15;
        this.comboCooldownAmount = 300;
        this.jumpPower /= 1.4;
        this.maxJumps = 3;
        this.health.health = 85;
        this.health._health = 85;
        this.health.maxHealth = 85;
        this.kbMult = 0.25;
        this.kbDefence = 0.9;
        break;
      case "Heavyweight":
        this.speed /= 1.3;
        this.attackCooldown *= 1.2;
        this.specialCooldownMult = 4;
        this.attackRange *= 1.1;
        this.damage *= 1.25;
        this.comboCooldownAmount = 100;
        this.jumpPower /= 3;
        this.maxJumps = 3;
        this.health.health = 115;
        this.health._health = 115;
        this.health.maxHealth = 115;
        this.kbMult = 1.2;
        this.kbDefence = 1.5;
        break;
      case "Vampire":
        this.speed *= 1.2;
        this.attackCooldown /= 1.15;
        this.specialCooldownMult = 4;
        this.attackRange *= 1.2;
        this.damage /= 1.2;
        this.comboCooldownAmount = 150;
        this.jumpPower /= 4;
        this.maxJumps = 24;
        this.health.health = 40;
        this.health._health = 40;
        this.health.maxHealth = 40;
        this.kbMult = 0;
        this.kbDefence = 0.9;

        this.accessoriesUnder.push(new VampireWing(this, true));    // left
        this.accessoriesUnder.push(new VampireWing(this, false));   // right
        break;
      case "Support":
        this.damage /= 1.5;
        this.attackCooldown *= 1.5;
        this.specialCooldownMult = 6;
        this.health.health = 120;
        this.health._health = 120;
        this.health.maxHealth = 120;
        this.kbMult = 1.5;
        this.kbDefence = 1.5;
        break;
      case "Psycopath":
        this.speed /= 1.5;
        this.jumpPower /= 1.5;
        this.maxJumps = 1;
        this.health.health = 150;
        this.health._health = 150;
        this.health.maxHealth = 150;
        this.damage /= 1.5;
        this.attackCooldown *= 1.5;
        this.specialCooldownMult = 2;
        this.kbMult /= 1.5;
        this.kbDefence /= 1.5;
        this.comboCooldownAmount = 750;
        break;
      case "Juggernaut":
        this.w *= 1.4;
        this.h *= 1.4;
        this.speed /= 2;
        this.attackRange *= 1.25;
        this.attackCooldown *= 2;
        this.health.health = 300;
        this.health._health = 300;
        this.health.maxHealth = 300;
        this.kbDefence *= 5;
        this.kbMult = 1.25;
        break;
      default:
        break;
    }
  }

  jump() {
    if (this.jumpCounter >= this.maxJumps) return;

    this.isPhasing = false;
    this.forces[2].y = this.jumpPower;
    this.forces[4].y = 0;
    this.jumpCounter++;
  }

  attack(special = false, groundPounding = false) {
    if (!groundPounding && !this.attackable) return;

    let hasHit = false;

    for (let i = 0; i < this.otherPlayers.length; i++) {
      let otherplayer = this.otherPlayers[i];

      if (otherplayer.team != this.team) {
        var distance =
          Math.abs(otherplayer.x + otherplayer.w / 2 - (this.x + this.w / 2)) *
          Math.abs(otherplayer.x + otherplayer.w / 2 - (this.x + this.w / 2)) +
          Math.abs(otherplayer.y + otherplayer.h / 2 - (this.y + this.h / 2)) *
          Math.abs(otherplayer.y + otherplayer.h / 2 - (this.y + this.h / 2));

        if (groundPounding) distance /= 2;

        if (distance <= this.attackRange * this.attackRange && otherplayer.health.health > 0) {
          otherplayer.lastPlayerHit = this;

          let attackForce = otherplayer.health.health / otherplayer.health.maxHealth;
          if (attackForce <= 0.001) attackForce = 0.001;

          let damage = (this.damage || 0);

          if (groundPounding) {
            attackForce = attackForce / (this.jumpPower / 36.5);
            damage = damage / 2.25;
          }

          let xForce = ((otherplayer.x + (otherplayer.w / 2)) - (this.x + this.w / 2)) / Math.pow(attackForce, 2);
          xForce *= this.kbMult;
          if (Math.abs(xForce) > 200) {
            if (xForce < 0) xForce = -200;
            else xForce = 200;
          }
          otherplayer.forces[1].x += xForce;
          let yForce = -((otherplayer.y + (otherplayer.h / 2)) - (this.y + this.h / 2)) / attackForce;
          yForce *= this.kbMult;
          if (-yForce > 100) yForce = -100;
          otherplayer.forces[1].y += yForce;

          let power = this.attackRange / Math.sqrt(Math.pow(otherplayer.x - this.x, 2) + Math.pow(otherplayer.y - this.y, 2)) * damage;

          if (power > Math.pow(damage, 2.5)) {
            power = Math.pow(damage, 2.5);
          }

          if (power < Math.pow(damage, 1.5)) {
            power = Math.pow(damage, 1.5);
          }

          if (!groundPounding) {
            this.combo += 1;
            otherplayer.combo = 0;
            hasHit = true;

            switch (this.class) {
              case "Berserk":
                power *= 1 + 0.25 * this.combo;
                break;
              case "Tank":
                power *= 1 + 0 * this.combo;
                break;
              case "Ninja":
                power *= 1 + 0.15 * this.combo;
                break;
              case "Heavyweight":
                power *= 1 + 0.4 * this.combo;
                break;
              case "Vampire":
                power *= 1 + 0.15 * this.combo;

                let divisor = 4 - this.killCount / 3;
                if (this.killCount > 6) divisor = 2;
                divisor *= this.health.health / this.health.maxHealth;
                let healAmount = power / divisor;

                if (healAmount > this.health.maxHealth) {
                  healAmount = this.health.maxHealth;
                }

                this.health.modHealth(healAmount);
                break;
              case "Support":
                this.health.modHealth(this.combo * 2);
                break;
              case "Psycopath":
                power *= 1 + ((2 - this.health.health / this.health.maxHealth) * this.combo * ((this.killCount + 1) / 2));
                this.effectors.push(killingMachine(this.combo * (this.killCount + 1), 10 * (this.killCount + 1)));
                break;
              default:
                power *= 1 + 0.5 * this.combo;
                break;
            }
          }

          let roundedPower = Math.round(power * 100) / 100;
          GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> dealt ${roundedPower} damage against <span style="color: ${otherplayer.color};">[Player ${otherplayer.playerNum}]</span>!`, "#A0A0A0")

          otherplayer.health.modHealth(-power, "attack");
          otherplayer.grounded = false;
        }
      } else {
        var distance =
          Math.abs(otherplayer.x + otherplayer.w / 2 - (this.x + this.w / 2)) *
          Math.abs(otherplayer.x + otherplayer.w / 2 - (this.x + this.w / 2)) +
          Math.abs(otherplayer.y + otherplayer.h / 2 - (this.y + this.h / 2)) *
          Math.abs(otherplayer.y + otherplayer.h / 2 - (this.y + this.h / 2));

        if (otherplayer.team == this.team
          && distance <= this.attackRange * this.attackRange * (9 * (this.killCount + 1)) && otherplayer.health.health > 0) {
          switch (this.class) {
            case "Support":
              let healAmount = otherplayer.health.maxHealth - otherplayer.health.health;

              if (healAmount < 0) {
                healAmount = 0;
              } else if (healAmount > otherplayer.health.maxHealth * 0.05) {
                healAmount = otherplayer.health.maxHealth * 0.05;
              }

              otherplayer.health.modHealth(healAmount);

              if (healAmount > 0) {
                this.health.modHealth(this.health.maxHealth * 0.025);
              }
              break;
            default:
              break;
          }
        }
      }
    }

    if (!hasHit || special || groundPounding) {
      this.combo = 0;
    }

    if (!groundPounding && !special) {
      this.coolAttack();
    }
  }

  special() {
    if (!this.attackable) return;

    switch (this.class) {
      case "Berserk":
        this.effectors.push(kbBoost(20, 1.5));
        this.kbMult *= 1.5;
        this.attackRange *= 2;
        this.attack(true);
        this.kbMult /= 1.5;
        this.attackRange /= 2;
        break;
      case "Tank":
        this.health.modHealth(30);
        this.effectors.push(damageDefence(10, 2));
        break;
      case "Ninja":
        this.effectors.push(regeneration(5, 8));
        this.effectors.push(kbDefence(5, 8));
        this.speed *= 0.01;
        this.jumpPower *= 0.01;
        setTimeout(() => {
          this.speed /= 0.01;
          this.jumpPower /= 0.01;
        }, 12000);
        break;
      case "Heavyweight":
        this.damage *= 1.5;
        this.kbMult *= 5;
        this.attack(true);
        this.damage /= 1.5;
        this.kbMult /= 5;
        break;
      case "Vampire":
        this.health.maxHealth += 10;
        this.health.modHealth(-10);
        this.maxJumps = 4;
        this.speed /= 4;
        setTimeout(() => {
          this.maxJumps = 24;
          this.speed *= 4;
        }, 8000);
        break;
      case "Support":
        this.health.modHealth(10);

        for (let i = 0; i < this.otherPlayers.length; i++) {
          if (this.otherPlayers[i].team == this.team) {
            let otherplayer = this.otherPlayers[i];

            let healAmount = otherplayer.health.maxHealth - otherplayer.health.health;

            if (healAmount < 0) {
              healAmount = 0;
            } else if (healAmount > otherplayer.health.maxHealth * 0.3) {
              healAmount = otherplayer.health.maxHealth * 0.3;
            }

            otherplayer.health.modHealth(healAmount);

            if (healAmount > 0) {
              this.health.modHealth(25);
            }
          }
        }

        break;
      case "Psycopath":
        if (this.health.health > 30) {
          this.effectors.push(regeneration(Math.floor(Math.min(10, (this.health.health - 30) / 5)), -5));
        } else if (this.health.health > 10) {
          this.effectors.push(regeneration(Math.floor((this.health.health - 10) / 5), -5));
        } else {
          return;
        }

        this.effectors.push(bloodlust(20));
        break;
      case "Juggernaut":
        // Make it rain meteors!
        //break;
        return; // for now...
      // maybe at some point I'll finally get to adding meteors.
      default:
        this.effectors.push(kbDefence(10, 1));
        this.effectors.push(damageDefence(10, 1));
        this.effectors.push(regeneration(3, 1));
        break;
    }

    this.coolAttack(true);
  }

  coolAttack(special = false) {
    this.attackable = false;
    this.showCooldown = true;
    const intervalStep = 20;
    let step = 0;

    // setTimeout(() => {this.attackable = true;}, this.attackCooldown * 1000);
    const process = setInterval(() => {
      let cooldownTime = (this.attackCooldown * 1000) - (this.combo * this.comboCooldownAmount)

      if (special) {
        cooldownTime = (this.attackCooldown * 1000) * this.specialCooldownMult;
      }

      if (step >= cooldownTime) {
        this.attackable = true;
        this.showCooldown = false;
        clearInterval(process);
      }

      let decimalPart = step / cooldownTime;
      if (decimalPart > 1) decimalPart = 1;
      if (decimalPart < 0) decimalPart = 0;
      this.attkCooldownObjs[1].w = this.attkCooldownObjs[0].w * decimalPart;

      step += intervalStep;
    }, intervalStep);
  }

  groundPound() {
    if (this.grounded) return;

    if (this.class == "Heavyweight") return;
    if (this.class == "Vampire") return;
    if (this.class == "Support") return;
    if (this.class == "Psycopath") return;

    this.groundPounding = true;
  }

  killBuff() {
    switch (this.class) {
      case "Berserk":
        this.damage *= 1.05;
        this.jumpPower *= 1.1;
        this.health.modHealth(15);
        this.kbMult *= 1.1;
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff Begin [`, "#FFFF00"); });
        this.effectors.push(bloodlust(15));
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff End ]`, "#FFFF00"); });
        break;
      case "Tank":
        this.health.maxHealth += 50;
        if (this.health.health < this.health.maxHealth) this.health.modHealth((this.health.maxHealth - this.health.health) / this.healMult);
        this.kbDefence *= 2;
        this.speed /= 1.1;
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff Begin [`, "#FFFF00"); });
        this.effectors.push(kbDefence(18, 2));
        this.effectors.push(kbBoost(18, 2));
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff End ]`, "#FFFF00"); });
        break;
      case "Ninja":
        this.attackCooldown /= 1.2;
        this.speed *= 1.1;
        this.jumpPower *= 1.1;
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff Begin [`, "#FFFF00"); });
        this.effectors.push(damageBoost(16, 2));
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff End ]`, "#FFFF00"); });
        this.maxJumps += 1;
        break;
      case "Heavyweight":
        this.damage *= 1.15;
        this.speed *= 1.1;
        this.kbDefence *= 1.2;
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff Begin [`, "#FFFF00"); });
        this.effectors.push(regeneration(30, 1));
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff End ]`, "#FFFF00"); });
        break;
      case "Vampire":
        this.damage *= 1.1;
        this.kbDefence *= 1.3;
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff Begin [`, "#FFFF00"); });
        this.effectors.push(speedBoost(20, 1.5));
        this.effectors.push(jumpBoost(20, 1.5));
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff End ]`, "#FFFF00"); });
        break;
      case "Support":
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff Begin [`, "#FFFF00"); });
        for (let i = 0; i < this.otherPlayers.length; i++) {
          if (this.otherPlayers[i].team == this.team) {
            //this.otherPlayers[i].killBuff();

            const abilities = [
              regeneration(5, 5),
              abilitySpeed(5, 2),
              damageBoost(5, 2),
              jumpBoost(5, 2),
              speedBoost(5, 4),
              kbBoost(5, 3),
              kbDefence(5, 5),
              damageDefence(5, 5),
              healBoost(5, 5),
            ];

            let ab1 = Math.floor(Math.random() * abilities.length);
            if (ab1 == abilities.length) ab1 = -1;

            let ab2 = Math.floor(Math.random() * abilities.length);
            if (ab2 == abilities.length) ab2 = -1;

            let ab3 = Math.floor(Math.random() * abilities.length);
            if (ab3 == abilities.length) ab3 = -1;

            this.otherPlayers[i].effectors.push(regeneration(10, 1));
            this.otherPlayers[i].effectors.push(abilities[ab1]);
            this.otherPlayers[i].effectors.push(abilities[ab2]);
            this.otherPlayers[i].effectors.push(abilities[ab3]);
          }
        }
        this.damage *= 1.1;
      this.health.maxHealth += 20;
        this.health.modHealth(Math.max(0, this.health.maxHealth - this.health.health));
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff End ]`, "#FFFF00"); });

        break;
      case "Psycopath":
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff Begin [`, "#FFFF00"); });
        this.effectors.push(damageDefence(8, 999999))
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff End ]`, "#FFFF00"); });
        break;
      default:
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff Begin [`, "#FFFF00"); });
        this.effectors.push(regeneration(3, 5));
        this.effectors.push(abilitySpeed(3, 2));
        this.effectors.push(damageBoost(3, 2));
        this.effectors.push(jumpBoost(3, 2));
        this.effectors.push(speedBoost(3, 4));
        this.effectors.push(kbBoost(3, 3));
        this.effectors.push(kbDefence(3, 5));
        this.effectors.push(damageDefence(3, 2));
        this.effectors.push(healBoost(3, 2));
        this.effectors.push((_player) => { GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Kill Buff End ]`, "#FFFF00"); });
        break;
    }
  }

  respawn() {
    this.health.health = this.health.maxHealth;
    this.health._health = this.health.maxHealth;

    this.defenceDivisor = 0;
    this.x = this.respawnPoint[0];
    this.y = this.respawnPoint[1];
    this.screenObject.color = this.health.color;

    setTimeout(() => {
      this.defenceDivisor = 1;
    }, 2500);
  }

  updatePhysics(platforms: Platform[], powerUps: PowerUpBox[]) {
    this.xVelocity = 0;
    this.yVelocity = 0;

    if (this.health.health > 0) {
      if (this.defenceDivisor > 0) {
        for (let i = 0; i < this.effectors.length; i++) {
          this.effectors.shift()(this);
        }
      }

      if ((this.y > HEIGHT * 4 || this.y < -HEIGHT || this.x < -WIDTH || this.x > WIDTH * 4) && this.health.health > 0) {
        this.health.modHealth(-9999, "void");
      }
    }

    if (this.moving) {
      this.forces[0].x = this.speed * this.moveDir;
      if (this.class == "Psycopath") this.forces[0].x *= 3 - (this.health.health / this.health.maxHealth) * 2;

      if (this.health.health <= 0) this.moving = false;
    }

    if (this.grounded) {
      this.jumpCounter = 0;
    }

    if (!this.moving && this.forces[0].x != 0) {
      this.forces[0].x *= this.drag;

      if (Math.abs(this.forces[0].x) < 0.01) {
        this.forces[0].x = 0;
      }
    }

    if (Math.abs(this.forces[1].x) > 0) {
      this.forces[1].x *= this.drag;
    }

    if (Math.abs(this.forces[1].y) > 0) {
      this.forces[1].y *= this.drag;
    }

    if (this.forces[2].y > 0) {
      this.grounded = false;
    }

    if (this.forces[2].y < 0.01) {
      this.forces[2].y = 0;
    } else {
      this.forces[2].y = this.forces[2].y / 1.2;
    }

    if (this.groundPounding) {
      this.forces[3].y = -15;
    } else {
      this.forces[3].y = 0;
    }

    if (!this.grounded || this.moving || (Math.abs(this.forces[0].x) + Math.abs(this.forces[1].x)) > 0) this.forces[4].y -= this.gravity;
    if (this.forces[4].y < this.terminalVelocity) this.forces[4].y = this.terminalVelocity;

    //if (this.y + this.h >= 2 * HEIGHT) {
    //    this.y = 2 * HEIGHT - this.h;
    //    this.forces[4].y = 0;
    //    if (this.groundPounding) {
    //        this.attack();
    //        this.groundPounding = false;
    //    }
    //    this.grounded = true;
    //} else {
    //    this.grounded = false;
    //}

    for (let i = 0; i < this.forces.length; i++) {
      if (i == 1) {
        this.xVelocity += this.forces[i].x / this.kbDefence;
        this.yVelocity -= this.forces[i].y / this.kbDefence;
      } else {
        this.xVelocity += this.forces[i].x;
        this.yVelocity -= this.forces[i].y;
      }
    }

    this.x += this.xVelocity;
    this.y += this.yVelocity;

    for (let i = 0; i < platforms.length; i++) {
      if (platforms[i].screenObjects[0].isCollided(this.screenObject)
        && this.yVelocity >= 0
        && (this.y <= platforms[i].y || this.groundPounding)) {

        if (!this.isPhasing || platforms[i].unpassable) {
          this.y = platforms[i].y - this.h;
          this.forces[4].y = 0;
          if (this.groundPounding) {
            this.attack(false, true);
            this.groundPounding = false;
          }
          this.groundPounding = false;
          this.grounded = true;
        }

      }
    }

    if (this.forces[4].y < -1) {
      this.grounded = false;
    }

    for (let i = 0; i < this.forces.length; i++) {
      if (Math.abs(this.forces[i].x) < 0.01) this.forces[i].x = 0;
      if (Math.abs(this.forces[i].y) < 0.01) this.forces[i].y = 0;
    }

    if (this.health.health > 0) {
      for (let i = 0; i < powerUps.length; i++) {
        if (powerUps[i].screenObject.isCollided(this.screenObject)) {
          powerUps[i].givePowerUp(this);
        }
      }
    }

    this.health.update();

    if (this.showCooldown) {
      for (let i = 0; i < this.attkCooldownObjs.length; i++) {
        this.attkCooldownObjs[i].x = this.x;
        this.attkCooldownObjs[i].y = this.y - 30;
      }
    }
  }

  draw() {
    this.screenObject.x = this.x;
    this.screenObject.y = this.y;
    this.screenObject.w = this.w;
    this.screenObject.h = this.h;

    this.accessoriesUnder.map((acc) => { acc.draw(); });
    this.screenObject.draw();
    this.accessoriesOver.map((acc) => { acc.draw(); });

    if (this.showCooldown) {
      for (let i = 0; i < this.attkCooldownObjs.length; i++) {
        this.attkCooldownObjs[i].draw();
      }
    }
  }

  listenKeyDown(event: KeyboardEvent) {
    if (this.health.health <= 0) return;

    switch (event.key) {
      case this.controls.left:
        this.moveDir = -1;
        this.moving = true;
        break;
      case this.controls.right:
        this.moveDir = 1;
        this.moving = true;
        break;
      case this.controls.up:
        this.jump();
        break;
      case this.controls.down:
        if (this.grounded) {
          this.isPhasing = true;

          setTimeout(() => {
            this.isPhasing = false;
          }, 400);
        } else {
          this.groundPound();
        }
        break;
      case this.controls.attack:
        this.attack();
        break;
      case this.controls.special:
        this.special();
        break;
    }
  }

  listenKeyUp(event: KeyboardEvent) {
    if (this.health.health <= 0) return;

    switch (event.key) {
      case this.controls.left:
        this.moving = false;
        break;
      case this.controls.right:
        this.moving = false;
        break;
      case this.controls.up:
        break;
      case this.controls.down:
        break;
      case this.controls.attack:
        break;
    }
  }
}

export class PlayerHealth {
  // This is the player health class
  // It'll have all the powerup effects related to health and will draw a health bar.

  health: number;
  maxHealth: number;
  color: string;
  inactiveColor: string;
  parent: Player;
  parentNum: number;

  _health: number;
  borderMargin: number;

  x: number;
  y: number;
  w: number;
  h: number;
  constX: number;
  constW: number;

  screenObject: ScreenObject;
  backObject: ScreenObject;
  borderObject: ScreenObject;
  textObject: TextObject;
  comboObject: any;
  killObject: any;
  textBorderObject: ScreenObject;
  damageHealIndicators: TextObject[];

  constructor(health: number, maxHealth: number, color: string, inactiveColor: string, borderColor: string, parent: Player) {
    this.health = health;
    this.maxHealth = maxHealth;
    this.color = color;
    this.inactiveColor = inactiveColor;
    this.parent = parent;
    this.parentNum = parent.playerNum;

    // Used for animation and will be drawn
    this._health = health;
    this.borderMargin = 10;

    this.w = 200;
    this.constW = 200;
    this.h = 50;

    if (this.parentNum == 1 || this.parentNum == 3) this.x = 50;
    if (this.parentNum == 1 || this.parentNum == 2) this.y = 50;
    if (this.parentNum == 2 || this.parentNum == 4) this.x = WIDTH - 50 - this.w;
    if (this.parentNum == 3 || this.parentNum == 4) this.y = HEIGHT - 50 - this.h;

    this.constX = this.x;

    this.screenObject = new ScreenObject(
      this.x,
      this.y,
      this.w,
      this.h,
      this.color,
      false
    );

    this.backObject = new ScreenObject(
      this.x,
      this.y,
      this.w,
      this.h,
      this.inactiveColor,
      false
    );

    this.borderObject = new ScreenObject(
      this.x - this.borderMargin,
      this.y - this.borderMargin,
      this.w + this.borderMargin * 2,
      this.h + this.borderMargin * 2,
      borderColor,
      false
    );

    this.textObject = new TextObject(
      this.x + this.borderMargin,
      this.y + this.h / 2 + this.borderMargin,
      this.w,
      this.h,
      this.health.toString(),
      borderColor,
      "38px sans"
    );

    this.comboObject = new TextObject(
      this.x,
      this.y + this.h * 1.5 + this.borderMargin * 2,
      this.w,
      this.h / 2,
      `Combo: ${this.parent.combo}`,
      this.color,
      "18px sans"
    );

    this.killObject = new TextObject(
      this.x,
      this.y + this.h * 2 + this.borderMargin * 2,
      this.w,
      this.h / 2,
      `Kill Count: ${this.parent.killCount}`,
      this.color,
      "18px sans"
    );

    this.textBorderObject = new ScreenObject(
      this.x - this.borderMargin,
      this.y + this.h * 1.5,
      this.w + this.borderMargin * 2,
      this.h + this.borderMargin,
      borderColor,
      false
    );

    if (this.parentNum > 2) {
      this.comboObject.y = this.y - this.h / 2 - this.borderMargin * 1.5;
      this.killObject.y = this.y - this.h - this.borderMargin * 1.5;
      this.textBorderObject.y = this.y - this.h * 2 + this.borderMargin;
    }


    this.damageHealIndicators = [];
  }

  update() {
    if (this.health <= 0) {
      this.health = 0;
      this.parent.screenObject.color = this.parent.inactiveColor;
      // we --die-- are dead :P
    }
  }

  draw() {
    // Make a screenobject for the healthbar
    // And draw it.
    // Also make it look like the button with the border and colors for when damage happens.
    if (this._health < 0) this._health = 0;

    for (let i = 0; i < this.damageHealIndicators.length; i++) {
      this.damageHealIndicators[i].draw();
    }

    this.screenObject.w = this._health / this.maxHealth * this.constW;
    if (this.parentNum == 2 || this.parentNum == 4) {
      this.screenObject.x = this.constX + ((this.maxHealth - this._health) / this.maxHealth * this.constW);
      this.borderObject.x = this.screenObject.x - 10;
      if (this.borderObject.x > this.backObject.x - 10) this.borderObject.x = this.backObject.x - 10;
      this.borderObject.w = this.screenObject.w + 20;
      if (this.borderObject.w < this.backObject.w + 20) this.borderObject.w = this.backObject.w + 20;
    } else {
      this.borderObject.x = this.screenObject.x - 10;
      if (this._health > this.maxHealth) this.borderObject.w = this.screenObject.w + 20;
      else this.borderObject.w = this.constW + 20;
    }

    this.borderObject.draw();
    this.backObject.draw();
    this.screenObject.draw();

    this.textBorderObject.draw();

    this.textObject.text = (Math.round(this.health * 100) / 100).toString();
    this.textObject.draw();

    //this.comboObject.text = `Combo: ${this.parent.combo}`;
    this.comboObject.text = Gamemode.instance.healthText(this.parent, 1);
    this.comboObject.draw();

    //this.killObject.text = `Kill Count: ${this.parent.killCount}`;
    this.killObject.text = Gamemode.instance.healthText(this.parent, 2);
    this.killObject.draw();
  }

  afterDeath(reason: string) {
    if (this.parent.lastPlayerHit == null) {
      if (reason == "void") {
        switch (Math.floor(Math.random() * 4)) {
          case 0:
            GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> jumped over the edge!`, "#A0A0A0");
            break;
          case 1:
            GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> died of fall damage!`, "#A0A0A0");
            break;
          case 2:
            GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> thought the floor was lava!`, "#A0A0A0");
            break;
          default:
            GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> thought he had an elytra!`, "#A0A0A0");
            break;
        }
      } else {
        GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> has died!`, "#A0A0A0");
      }
    } else {
      if (reason == "void") {
        switch (Math.floor(Math.random() * 4)) {
          case 0:
            GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> was knocked into the void by <span style="color: ${this.parent.lastPlayerHit.color};">[Player ${this.parent.lastPlayerHit.playerNum}]</span>!`, "#A0A0A0");
            break;
          case 1:
            GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> touched grass because of <span style="color: ${this.parent.lastPlayerHit.color};">[Player ${this.parent.lastPlayerHit.playerNum}]</span>!`, "#A0A0A0");
            break;
          case 2:
            GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> tried to run away from <span style="color: ${this.parent.lastPlayerHit.color};">[Player ${this.parent.lastPlayerHit.playerNum}]</span>!`, "#A0A0A0");
            break;
          default:
            GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> took a dive because of <span style="color: ${this.parent.lastPlayerHit.color};">[Player ${this.parent.lastPlayerHit.playerNum}]</span>!`, "#A0A0A0");
            break;
        }
      } else if (reason == "attack") {
        switch (Math.floor(Math.random() * 4)) {
          case 0:
            GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> got stabbed by <span style="color: ${this.parent.lastPlayerHit.color};">[Player ${this.parent.lastPlayerHit.playerNum}]</span>!`, "#A0A0A0");
            break;
          case 1:
            GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> was steam-rolled over by <span style="color: ${this.parent.lastPlayerHit.color};">[Player ${this.parent.lastPlayerHit.playerNum}]</span>!`, "#A0A0A0");
            break;
          case 2:
            GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> died of fear from <span style="color: ${this.parent.lastPlayerHit.color};">[Player ${this.parent.lastPlayerHit.playerNum}]</span>!`, "#A0A0A0");
            break;
          default:
            GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> spontaneously combusted because of <span style="color: ${this.parent.lastPlayerHit.color};">[Player ${this.parent.lastPlayerHit.playerNum}]</span>!`, "#A0A0A0");
            break;
        }
      } else {
        GameConsole.log(`<span style="color: ${this.color};">[Player ${this.parent.playerNum}]</span> was killed by <span style="color: ${this.parent.lastPlayerHit.color};">[Player ${this.parent.lastPlayerHit.playerNum}]</span>!`, "#A0A0A0");
      }

      // Up Kill Count
      this.parent.lastPlayerHit.killCount++;
      this.parent.lastPlayerHit.killBuff();
    }

    if (Gamemode.instance.lives) this.parent.lives -= 1;
    this.parent.deaths++;

    // if the gamemode has respawning respawn
    if (Gamemode.instance.respawn) {
      if (this.parent.lives <= 0) return;

      setTimeout(() => {
        // in this function the player will get
        // invincibility and respawn at their spawn point
        this.parent.respawn();
      }, 2500);
    }
  }

  modHealth(amount: number, reason?: string) {
    if (this.health <= 0) return;

    if (amount < 0) amount *= this.parent.defenceDivisor;
    if (amount > 0) amount *= this.parent.healMult;
    this.health += amount;

    let roundedAmount = Math.floor(amount * 100) / 100;

    if (amount > 0) {
      this.damageHealIndicators.push(
        new TextObject(
          this.parent.x + this.parent.w / 2 - Math.floor(Math.random() * 16 - 8) * 5,
          this.parent.y + this.parent.h / 2 - Math.floor(Math.random() * 16 - 8) * 5,
          400,
          400,
          `+${roundedAmount}`,
          "#00FF00",
          `${Math.floor(Math.abs(amount / 4)) + 50}px sans`,
          true,
          8,
          "black"
        )
      );
    } else if (amount < 0) {
      this.damageHealIndicators.push(
        new TextObject(
          this.parent.x + this.parent.w / 2 - Math.floor(Math.random() * 16 - 8) * 5,
          this.parent.y + this.parent.h / 2 - Math.floor(Math.random() * 16 - 8) * 5,
          400,
          400,
          `${roundedAmount}`,
          "#FF0000",
          `${Math.floor(Math.abs(amount / 4)) + 50}px sans`,
          true,
          8,
          "black"
        )
      );
    } else {
      this.damageHealIndicators.push(
        new TextObject(
          this.parent.x + this.parent.w / 2 - Math.floor(Math.random() * 16 - 8) * 5,
          this.parent.y + this.parent.h / 2 - Math.floor(Math.random() * 16 - 8) * 5,
          400,
          400,
          `${roundedAmount}`,
          "#AAAAAA",
          `${Math.floor(Math.abs(amount / 4)) + 50}px sans`,
          true,
          8,
          "black"
        )
      );
    }

    setTimeout(() => {
      this.damageHealIndicators.shift();
    }, 1500);

    if (this.health <= 0) {
      this.afterDeath(reason);
    }

    // animating step
    let step = 0;
    let animSteps = 20; // we set this

    let anim = setInterval(() => {
      step++;

      if (step == animSteps) {
        if (this.health <= 0) {
          this._health = 0;
        }

        clearInterval(anim);
      }

      this._health += amount / animSteps;
    }, 10);
  }
}

function killingMachine(level: number, time: number) {
  return function(player: Player) {
    GameConsole.log(`<span style="color: ${player.color};">[Player ${player.playerNum}]</span> Effect KillingMachine { level: ${level} }`, "#7722aa");

    player.comboCooldownAmount *= 1 + 0.01 * level;
    player.speed *= 1 + 0.01 * level;
    player.jumpPower *= 1 + 0.01 * level;
    player.kbDefence *= 1 + 0.01 * level;
    player.damage *= 1 + 0.01 * level;
    player.kbDefence *= 1 + 0.01 * level;
    player.kbMult *= 1 + 0.01 * level;

    setTimeout(() => {
      player.comboCooldownAmount /= 1 + 0.01 * level;
      player.speed /= 1 + 0.01 * level;
      player.jumpPower /= 1 + 0.01 * level;
      player.kbDefence /= 1 + 0.01 * level;
      player.damage /= 1 + 0.01 * level;
      player.kbDefence /= 1 + 0.01 * level;
      player.kbMult /= 1 + 0.01 * level;
    }, time * 1000)
  }
}
