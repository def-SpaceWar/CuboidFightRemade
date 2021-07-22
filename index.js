// TODO: Make platform class with non-buggy collision system.
// TODO: Make a level with a bunch of platforms.
// TODO: Make a background image.
// TODO: Figure out how to add smooth zoom effects

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

        this.screenObject = new ScreenObject(
            this.x,
            this.y,
            this.w,
            this.h,
            this.color
        );
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
                break;
            case this.controls.right:
                break;
            case this.controls.up:
                break;
            case this.controls.down:
                break;
            case this.controls.attack:
                break;
        }
    }

    listenKeyUp(event) {
        switch (event.key) {
            case this.controls.left:
                break;
            case this.controls.right:
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
)

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

    player.draw();
}

setInterval(update, 20);

