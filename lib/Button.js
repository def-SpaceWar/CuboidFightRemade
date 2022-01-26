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
