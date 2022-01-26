class Player {
    // This is the player.
    // It will have 2 screen objects.
    // One for the health bar, and one for the player itself.

    constructor(x, y, w, h, color, controls) {
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

        this.forces = [
            {x: 0, y: 0},   // Movement
            {x: 0, y: 0},   // Attacking
            {x: 0, y: 0},   // Jumping
            {x: 0, y: 0},   // Ground Pound
            {x: 0, y: 0},   // Gravity
        ];

        this.moving = false;
        this.jumping = false;
        this.groundPounding = false;
        this.gravity = 0.2;
        this.drag = 0.8;
        this.grounded = false;

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
        if (this.jumping) return;

        this.forces[2].y = 50;
        this.jumping = true;
    }

    attack() {
        for (let i = 0; i < this.otherPlayers.length; i++) {
            /** @type Player */
            let otherplayer = this.otherPlayers[i];

            var distance =
                Math.abs(otherplayer.x - this.x) *
                Math.abs(otherplayer.x - this.x) +
                (Math.abs(otherplayer.y - this.y) / 2) *
                (Math.abs(otherplayer.y - this.y) / 2);
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
                let attackForce = 1.0;
                if (this.groundPounding) attackForce /= 1.15;

                otherplayer.forces[1].x = ((otherplayer.x + (otherplayer.w / 2)) - (this.x + this.w / 2)) / Math.pow(attackForce, 2);
                otherplayer.forces[1].y = -((otherplayer.y + (otherplayer.h / 2)) - (this.y + this.h / 2)) / Math.pow(attackForce, 2);
            }
        }
    }

    groundPound() {
        if (this.grounded) return;

        this.groundPounding = true;
    }

    updatePhysics(platforms) {
        this.xSpeed = 0;
        this.ySpeed = 0;

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
            this.jumping = true;
        } else {
            this.jumping = false;
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

        if (this.y + this.h >= 2 * HEIGHT) {
            this.y = 2 * HEIGHT - this.h;
            this.forces[4].y = 0;
            this.jumping = false;
            if (this.groundPounding) {
                this.attack();
                this.groundPounding = false;
            }
            this.grounded = true;
        } else {
            this.grounded = false;
        }

        for (let i = 0; i < this.forces.length; i++) {
            this.xSpeed += this.forces[i].x;
            this.ySpeed -= this.forces[i].y;
        }

        this.x += this.xSpeed;
        this.y += this.ySpeed;

        for (let i = 0; i < platforms.length; i++) {
            if (platforms[i].isCollided(this) && this.ySpeed >= 0 && (this.y <= platforms[i].y - (this.h / 2) || this.groundPounding)) {
                this.y = platforms[i].y - this.h;
                this.forces[4].y = 0;
                this.jumping = false;
                this.groundPounding = false;
                this.grounded = true;
            }
        }

    }

    draw() {
        this.screenObject.x = this.x;
        this.screenObject.y = this.y;
        this.screenObject.w = this.w;
        this.screenObject.h = this.h;

        this.screenObject.draw();
    }

    listenKeyDown(event) {
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
                this.groundPound(); // If the player is on a platform instead phase through the platform.
                break;
            case this.controls.attack:
                this.attack();
                break;
        }
    }

    listenKeyUp(event) {
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
    constructor(health, maxHealth, color) {
        this.health = health;
        this.maxHealth = maxHealth;
        this.color = color;
        // An array with a bunch of funciotns that have no return type. Useful for powerups/regen
        this.effectors = [];
    }

    update() {
        for (let i = 0; i < this.effectors.length; i++) {
            this.effectors[i](this);
        }
    }

    draw() {
        // Make a screenobject for the healthbar
        // And draw it.
        // Also make it look like the button with the border and colors for when damage happens.
    }
}


function regeneration(time) {
    return (playerHealth) => {
        console.log(`${playerHealth.health/playerHealth.maxHealth}%`);
    };
}
