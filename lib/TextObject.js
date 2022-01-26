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
