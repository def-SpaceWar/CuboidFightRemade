// TODO: Make a health system
// Closer attacks deal more damage.
// Farther attacks deal more knockback (already implemented).
// Ground pounds deal no damage but extra knockback.
// TODO: Make a level with a bunch of platforms.
// TODO: Make a background image.

/** @type HTMLCanvasElement */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// I'm too used to my variables being named like this.
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const bgImage = new Image(WIDTH * 2, HEIGHT * 2);
// TODO make this background more amazing lol.
bgImage.src = "./amazing_background.png";

const camera = {
    x: 0,
    y: 0,
    w_scale: 1,
    h_scale: 1
};

class ScreenObject {
    // This object/class is just something that is drawn on the screen.
    // So we don't have to keep copying and pasting the same function to draw
    // a freaking square.
    // And this could help with soon adding camera affects with zooming.
    // And detaching the actual object from the graphics.

    constructor(x, y, w, h, color, scale = true, glow = false, glowOffset = [0, 0], glowBlur = 20, glowColor = undefined) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.scale = scale;
        this.glow = glow;
        this.glowColor = glowColor || this.color;
        this.glowOffset = glowOffset;
        this.glowBlur = glowBlur;
    }

    draw() {
        ctx.fillStyle = this.color;

        if (this.glow) {
            ctx.shadowColor = this.glowColor;
            ctx.shadowOffsetX = this.glowOffset[0];
            ctx.shadowOffsetY = this.glowOffset[1];
            ctx.shadowBlur = this.glowBlur * camera.w_scale;
        } else {
            ctx.shadowColor = "#00000000";
        }

        if (this.scale) {
            ctx.fillRect(
                ((this.x + camera.x) * camera.w_scale) - WIDTH * (camera.w_scale - 1) / 2,
                ((this.y + camera.y) * camera.h_scale) - HEIGHT * (camera.h_scale - 1) / 2,
                this.w * camera.w_scale,
                this.h * camera.h_scale
            );
        } else {
            ctx.fillRect(
                this.x,
                this.y,
                this.w,
                this.h
            );
        }
    }
}

class TextObject {
    // Text object.
    // `font` paramater is used in this format:
    // "18px 'Comic Sans MS'"

    constructor(x, y, w, h, text, color, font) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.color = color;
        this.font = font;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.font = this.font;
        ctx.fillText(
            this.text,
            this.x,
            this.y,
            this.w,
            this.h
        );
    }
}

class Button {
    // For the button we'll have 2 screen objects and a text object.
    // 1 screenobject is the border (the border of the button) and the
    // button itself. The text is well, the text.

    // The button class is complicated so here is a template you can
    // copy and paste:
    //
    // let buttonTemplate = new Button(
    //     300,                                                    // x
    //     300,                                                    // y
    //     100,                                                    // w
    //     75,                                                     // h
    //     { inactive: "#0ad", active: "#0ef", pressed: "#aff" },  // colors
    //     5,                                                      // borderMargin
    //     "#333",                                                 // borderColor
    //     "Test",                                                 // text
    //     [-20, 0],                                               // textOffset
    //     "#000",                                                 // textColor
    //     () => { console.log("test"); },                         // onClick
    //     "20px 'Comic Sans MS'"                                  // font
    // );

    constructor(
        x,
        y,
        w,
        h,
        colors,
        borderMargin,
        borderColor,
        text,
        textOffset,
        textColor,
        onClick,
        font
    ) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.colors = colors;
        this.color = colors.inactive;
        this.borderMargin = borderMargin;
        this.onClick = onClick;
        this.isPressed = false;

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

        this.textObject = new TextObject(
            this.x + this.w / 2 + textOffset[0],
            this.y + this.h / 2 + borderMargin / 2 + textOffset[1],
            this.w,
            this.h,
            text,
            textColor,
            font
        );
    }

    draw() {
        this.screenObject.color = this.color;

        this.borderObject.draw();
        this.screenObject.draw();
        this.textObject.draw();
    }

    listenMouseMove(event) {
        var rect = canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        this.color = this.colors.inactive;

        if (
            mouseX >= this.x + this.borderMargin &&
            mouseX <= this.x + this.w - this.borderMargin
        ) {
            if (mouseY >= this.y && mouseY <= this.y + this.h) {
                this.color = this.colors.active;
            }
        }
    }

    listenMouseDown(event) {
        var rect = canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        this.color = this.colors.inactive;
        this.isPressed = false;

        if (mouseX >= this.x && mouseX <= this.x + this.w) {
            if (mouseY >= this.y && mouseY <= this.y + this.h) {
                this.color = this.colors.pressed;
                this.isPressed = true;
            }
        }
    }

    listenMouseUp(event) {
        var rect = canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        this.color = this.colors.inactive;

        if (mouseX >= this.x && mouseX <= this.x + this.w) {
            if (mouseY >= this.y && mouseY <= this.y + this.h) {
                this.onClick();
                this.isPressed = false;
            }
        }
    }
}

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
                this.groundPound();
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

const player = new Player(
    100,
    100,
    75,
    75,
    "#f00",
    {
        left: "ArrowLeft",
        right: "ArrowRight",
        up: "ArrowUp",
        down: "ArrowDown",
        attack: "m"
    }
);

const player2 = new Player(
    1000,
    100,
    75,
    75,
    "#00f",
    {
        left: "s",
        right: "f",
        up: "e",
        down: "d",
        attack: "q"
    }
);

player.otherPlayers.push(player2);
player2.otherPlayers.push(player);

const platforms = [
    new Platform(
        400,
        600,
        100,
        20,
        {top: "#9f1", bottom: "#320"}
    ),
    new Platform(
        400,
        800,
        100,
        20,
        {top: "#9f1", bottom: "#320"}
    ),
    new Platform(
        400,
        1000,
        100,
        20,
        {top: "#9f1", bottom: "#320"}
    ),

    new Platform(
        400,
        400,
        100,
        20,
        {top: "#9f1", bottom: "#320"}
    ),
]

const button = new Button(100, 100, 300, 80, {inactive: "#0ad", active: "#0ef", pressed: "#aff"}, 10, "#555", "Hi", [-25, 10], "#000", () => setTimeout(() => console.log("Hi"), 5000), "40px 'Comic Sans MS'");

canvas.addEventListener("mousemove", (event) => {
    button.listenMouseMove(event);
});

canvas.addEventListener("mousedown", (event) => {
    button.listenMouseDown(event);
});

canvas.addEventListener("mouseup", (event) => {
    button.listenMouseUp(event);
});

document.addEventListener("keydown", (event) => {
    player.listenKeyDown(event);
    player2.listenKeyDown(event);
});

document.addEventListener("keyup", (event) => {
    player.listenKeyUp(event);
    player2.listenKeyUp(event);
});

function lerpCamera(obj1, obj2) {
    // obj1 and obj2 are of type ScreenObject

    // get midpounts
    let midpoint = {
        x: ((obj1.x + obj2.x + obj1.w / 2 + obj2.w / 2) / 2),
        y: ((obj1.y + obj2.y + obj1.h / 2 + obj2.h / 2) / 2)
    };

    // move camera
    camera.x = -midpoint.x + WIDTH / 2;
    camera.y = -midpoint.y + HEIGHT / 2;

    // resize camera
    let scale = 1;
    //distance = Math.sqrt(((obj1.x - obj2.x) ^ 2) + ((obj1.y - obj2.y) ^ 2));

    scale = Math.min(((HEIGHT * 0.75) / Math.abs(obj1.y - obj2.y)), ((WIDTH * 0.75) / Math.abs(obj1.x - obj2.x)));

    if (scale > 2) {
        scale = 2;
    } else if (scale < 0.25) {
        scale = 0.25;
    }

    camera.w_scale = camera.w_scale - (camera.w_scale - scale) / 10;
    camera.h_scale = camera.h_scale - (camera.h_scale - scale) / 10;
}

function update() {
    // This function runs every frame
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    player2.updatePhysics(platforms);
    player.updatePhysics(platforms);

    ctx.drawImage(
        bgImage,
        (-WIDTH / 2 + camera.x) * camera.w_scale - WIDTH * (camera.w_scale - 1) / 2,
        (-HEIGHT / 2 + camera.y) * camera.h_scale - HEIGHT * (camera.h_scale - 1) / 2,
        WIDTH * 3 * camera.w_scale,
        HEIGHT * 3 * camera.h_scale
    );

    for (let i = 0; i < platforms.length; i++) {
        platforms[i].draw();
    }

    player2.draw();
    player.draw();
    //button.draw();

    lerpCamera(player.screenObject, player2.screenObject);
}

setInterval(update, 20);
