// TODO: Make a non-buggy collision system.
// TODO: Make a level with a bunch of platforms.
// TODO: Make a background image.
// TODO: Figure out how to add smooth camera-like zoom effects

/** @type HTMLCanvasElement */
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// I'm too used to my variables being named like this.
let WIDTH = canvas.width;
let HEIGHT = canvas.height;

class ScreenObject {
    // This object/class is just something that is drawn on the screen.
    // So we don't have to keep copying and pasting the same function to draw
    // a freaking square.
    // And this could help with soon adding camera affects with zooming.
    // And detaching the actual object from the graphics.

    constructor(x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h)
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
    //     -20,                                                    // textOffset
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
            this.color
        );

        this.borderObject = new ScreenObject(
            this.x - this.borderMargin,
            this.y - this.borderMargin,
            this.w + this.borderMargin * 2,
            this.h + this.borderMargin * 2,
            borderColor
        );

        this.textObject = new TextObject(
            this.x + this.w / 2 + textOffset,
            this.y + this.h / 2 + borderMargin / 2,
            this.w,
            this.h,
            text,
            textColor,
            font
        )
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

        this.forces = [
            {x: 0, y: 0},   // Movement
            {x: 0, y: 0},   // Attacking
            {x: 0, y: 0},   // Jumping
            {x: 0, y: 0},   // Ground Pound
            {x: 0, y: 0},   // Gravity
        ];

        this.jumping = false;
        this.groundPounding = false;
        this.gravity = 0.2;
        this.grounded = false;

        this.screenObject = new ScreenObject(
            this.x,
            this.y,
            this.w,
            this.h,
            this.color
        );
    }

    jump() {
        if (this.jumping) return;

        this.forces[2].y = 50;
        this.jumping = true;
    }

    groundPound() {
        if (this.grounded) return;

        this.groundPounding = true;
    }

    updatePhysics() {
        this.xSpeed = 0;
        this.ySpeed = 0;

        if (this.forces[2].y > 0) {
            this.jumping = true;
        } else {
            this.jumping = false;
        }

        if (this.forces[2].y < 0.001) {
            this.forces[2].y = 0;
        } else {
            this.forces[2].y = this.forces[2].y / 1.1;
        }

        if (this.groundPounding) {
            this.forces[3].y = -20;
        } else {
            this.forces[3].y = 0;
        }

        this.forces[4].y -= this.gravity;

        if (this.y + this.h >= HEIGHT) {
            this.y = HEIGHT - this.h;
            this.forces[4].y = 0;
            this.jumping = false;
            this.groundPounding = false;
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
                break;
            case this.controls.right:
                this.forces[0].x = 5;
                break;
            case this.controls.up:
                this.jump();
                break;
            case this.controls.down:
                this.groundPound();
                break;
            case this.controls.attack:
                break;
        }
    }

    listenKeyUp(event) {
        switch (event.key) {
            case this.controls.left:
                this.forces[0].x = 0;
                break;
            case this.controls.right:
                this.forces[0].x = 0;
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
        if (player.x > this.x && player.x < this.x + this.w) {
            if (player.y > this.y && player.y < this.y + this.h) {
                return true;
            } else if (player.y + player.h > this.y && player.y + player.h < this.y + this.h) {
                return true;
            }
        } else if (player.x + player.w > this.x && player.x + player.w < this.x + this.w) {
            if (player.y > this.y && player.y < this.y + this.h) {
                return true;
            } else if (player.y + player.h > this.y && player.y + player.h < this.y + this.h) {
                return true;
            }
        }

        return false;
    }
}

let player = new Player(
    100,
    100,
    100,
    100,
    "#f00",
    {
        left: "ArrowLeft",
        right: "ArrowRight",
        up: "ArrowUp",
        down: "ArrowDown",
        attack: "m"
    }
);

let platforms = [
    new Platform(
        400,
        400,
        100,
        20,
        {top: "#9f1", bottom: "#320"}
    )
]

canvas.addEventListener("mousemove", (event) => {
});

canvas.addEventListener("mousedown", (event) => {
});

canvas.addEventListener("mouseup", (event) => {
});

document.addEventListener("keydown", (event) => {
    player.listenKeyDown(event);
});

document.addEventListener("keyup", (event) => {
    player.listenKeyUp(event);
});

function update() {
    // This function runs every frame
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    player.updatePhysics();
    player.draw();

    for (let i = 0; i < platforms.length; i++) {
        platforms[i].draw();
        console.log(platforms[i].isCollided(player));
    }
}

setInterval(update, 20);
