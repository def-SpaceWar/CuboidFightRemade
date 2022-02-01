let playerCounter = 0;

class Player {
    // This is the player.
    // It will have 2 screen objects.
    // One for the health bar, and one for the player itself.

    constructor(x, y, w, h, color, controls) {
        playerCounter += 1;
        this.playerNum = 0;
        this.playerNum += playerCounter;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.controls = controls;

        this.xSpeed = 0;
        this.ySpeed = 0;
        this.otherPlayers = [];
        this.attackRange = 100;
        this.attackForce = 50;

        this.health = new PlayerHealth(100, 100, this.color, "#333333", this.playerNum);
        this.damage = 4;
        // An array with a bunch of funciotns that have no return type. Useful for powerups/regen
        this.effectors = [];
        this.attackCooldown = 3;
        this.attackable = true;

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

        this.moving = false;
        // this.jumping = false;
        this.jumpCounter = 0;
        this.maxJumps = 2;
        this.groundPounding = false;
        this.gravity = 0.2;
        this.terminalVelocity = -45;
        this.drag = 0.8;
        this.grounded = false;
        this.isPhasing = false;
        this.phasingPlatform = -1;

        this.screenObject = new ScreenObject(
            this.x,
            this.y,
            this.w,
            this.h,
            this.color,
            true,
            true,
        );
    }

    jump() {
        if (this.jumpCounter >= this.maxJumps) return;

        this.phasingPlatform = -1;
        this.forces[2].y = 50;
        this.jumpCounter++;
    }

    attack() {
        if (!this.groundPounding && !this.attackable) return;

        for (let i = 0; i < this.otherPlayers.length; i++) {
            /** @type Player */
            let otherplayer = this.otherPlayers[i];

            var distance =
                Math.abs(otherplayer.x - this.x) *
                Math.abs(otherplayer.x - this.x) +
                (Math.abs(otherplayer.y - this.y) / 2) *
                (Math.abs(otherplayer.y - this.y) / 2);
            if (this.groundPounding) distance /= 2;
            if (distance <= this.attackRange * this.attackRange) {
                //otherplayer.health.health -= this.attack_damage / round_number;
                //otherplayer.moving = false;
                //otherplayer.x_speed =
                //    (otherplayer.x - this.x) /
                //    ((10 * otherplayer.health.health) /
                //        otherplayer.health.max_health);
                //otherplayer.y_speed =
                //    (otherplayer.y - this.y) /
                //    ((10 * otherplayer.health.health) /
                //        otherplayer.health.max_health);
                // force increases exponentially based on health but for now we put 100% health.
                let attackForce = otherplayer.health.health / otherplayer.health.maxHealth;
                if (attackForce <= 0.001) attackForce = 0.001;
                let damage = (this.damage || 0);
                if (this.groundPounding) attackForce = attackForce / 1.15;
                if (this.groundPounding) damage = damage / 2.25;

                let xForce = ((otherplayer.x + (otherplayer.w / 2)) - (this.x + this.w / 2)) / Math.pow(attackForce, 2);
                if (Math.abs(xForce) > 200) {
                    if (xForce < 0) xForce = -200;
                    else xForce = 200;
                }
                otherplayer.forces[1].x += xForce;
                let yForce = -((otherplayer.y + (otherplayer.h / 2)) - (this.y + this.h / 2)) / attackForce;
                if (-yForce > 100) yForce = -100;
                otherplayer.forces[1].y += yForce;

                let power = this.attackRange / Math.sqrt(Math.pow(otherplayer.x - this.x, 2) + Math.pow(otherplayer.y - this.y, 2)) * damage;

                if (power > Math.pow(damage, 2.5)) {
                    power = Math.pow(damage, 2.5);
                }

                otherplayer.health.modHealth(-power);

                if (otherplayer.health.health <= 0) {
                    GameConsole.log(`<span style="color: ${otherplayer.color};">[Player ${otherplayer.playerNum}]</span> was killed by <span style="color: ${this.color};">[Player ${this.playerNum}]</span>!`, "#FF9900");
                }

                if (!this.groundPounding) {
                    this.attackable = false;
                    setTimeout(() => {this.attackable = true;}, this.attackCooldown * 1000);
                }
            }
        }
    }

    groundPound() {
        if (this.grounded) return;

        this.groundPounding = true;
    }

    updatePhysics(platforms, powerUps) {
        this.xSpeed = 0;
        this.ySpeed = 0;

        for (let i = 0; i < this.effectors.length; i++) {
            this.effectors.shift()(this);
        }

        if (this.y > HEIGHT * 3 && this.health.health > 0) {
            this.health.modHealth(-this.health.health);
            GameConsole.log(`<span style="color: ${this.color};">[Player ${this.playerNum}]</span> Has Died!`, "#FF9900")
        }

        if (this.moving && this.health.health <= 0) this.moving = false;

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
            this.forces[3].y = -20;
        } else {
            this.forces[3].y = 0;
        }

        this.forces[4].y -= this.gravity;
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
            this.xSpeed += this.forces[i].x;
            this.ySpeed -= this.forces[i].y;
        }

        this.x += this.xSpeed;
        this.y += this.ySpeed;

        for (let i = 0; i < platforms.length; i++) {
            if (platforms[i].isCollided(this) && this.ySpeed >= 0 && (this.y <= platforms[i].y - (this.h / 2) || this.groundPounding)) {
                if (this.isPhasing) {
                    this.phasingPlatform = i;
                    this.isPhasing = false;
                    break;
                } else {
                    if (i != this.phasingPlatform) {
                        this.y = platforms[i].y - this.h;
                        this.forces[4].y = 0;
                        if (this.groundPounding) {
                            this.attack();
                            this.groundPounding = false;
                        }
                        this.groundPounding = false;
                        this.grounded = true;
                    }
                }
            }
        }

        for (let i = 0; i < powerUps.length; i++) {
            if (powerUps[i].isCollided(this)) {
                powerUps[i].givePowerUp(this);
            }
        }

        this.health.update();

    }

    draw() {
        this.screenObject.x = this.x;
        this.screenObject.y = this.y;
        this.screenObject.w = this.w;
        this.screenObject.h = this.h;

        this.screenObject.draw();
    }

    listenKeyDown(event) {
        if (this.health.health <= 0) return;

        switch (event.key) {
            case this.controls.left:
                this.forces[0].x = -5;
                this.moving = true;
                break;
            case this.controls.right:
                this.forces[0].x = 5;
                this.moving = true;
                break;
            case this.controls.up:
                this.jump();
                break;
            case this.controls.down:
                if (this.grounded) {
                    this.isPhasing = true;
                } else {
                    this.groundPound();
                }
                break;
            case this.controls.attack:
                this.attack();
                break;
        }
    }

    listenKeyUp(event) {
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

class PlayerHealth {
    // This is the player health class
    // It'll have all the powerup effects related to health and will draw a health bar.
    constructor(health, maxHealth, color, borderColor, parentNum) {
        this.health = health;
        this.maxHealth = maxHealth;
        this.color = color;
        this.parentNum = parentNum;

        // Used for animation and will be drawn
        this._health = health;
        this.borderMargin = 10;

        this.w = 200;
        this.constW = 200;
        this.h = 50;

        if (this.parentNum == 1 || this.parentNum == 3) this.x = 50;
        if (this.parentNum == 1 || this.parentNum == 2) this.y = 50;
        if (this.parentNum == 2) this.x = WIDTH - 50 - this.w;
        if (this.parentNum == 3) this.y = HEIGHT - 50 - this.h;

        this.constX = this.x;

        this.screenObject = new ScreenObject(
            this.x,
            this.y,
            this.w,
            this.h,
            this.color,
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
    }

    update() {
        if (this.health <= 0) {
            this.health = 0;
            // we die :P
        }
    }

    draw() {
        // Make a screenobject for the healthbar
        // And draw it.
        // Also make it look like the button with the border and colors for when damage happens.

        if (this._health < 0) this._health = 0;
        if (this._health > this.maxHealth) this.borderObject.w = this.screenObject.w + 20;
        else this.borderObject.w = this.constW + 20;
        this.borderObject.draw();

        this.screenObject.w = this._health / this.maxHealth * this.constW;
        if (this.parentNum == 2) {
            this.screenObject.x = this.constX + ((this.maxHealth - this._health) / this.maxHealth * this.constW);
            if (this._health > this.maxHealth) this.borderObject.w = this.screenObject.w - 20;
            if (this._health > this.maxHealth) this.borderObject.x = this.screenObject.x - 10;
        }
        //if (this._health > this.maxHealth) {
        //    this.screenObject.w = this.constW;
        //    this.absorbtionScreenObject.w = 100;
        //} else this.absorbtionScreenObject.w = 0;
        this.screenObject.draw();
        this.absorbtionScreenObject.draw();
    }

    modHealth(amount) {
        if (this.health == 0) return;

        // This function will deal with making the health animate.
        this.health += amount;

        // animating step
        let step = 0;
        let animSteps = 20; // we set this

        let anim = setInterval(() => {
            step++;
            if (step == animSteps) clearInterval(anim);
            this._health += amount / animSteps;
        }, 10);
    }
}