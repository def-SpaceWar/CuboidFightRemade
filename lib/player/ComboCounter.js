class ComboCounter {
    constructor(player, colors) {
        this.player = player;
        this.dimColor = colors[0];
        this.halfColor = colors[1];
        this.fullColor = colors[2];

        this.textObject = new TextObject(
            this.player.x + this.player.w * 2,
            this.player.y + this.player.h * 2,
            400,
            400,
            "Combo: 0",
            this.dimColor,
            "70px sans",
            true,
            8,
            "black" // stroke color
        );
    }

    draw() {
        if (this.player.combo < 2) return;

        this.textObject.x = this.player.x - this.player.w * 1;
        this.textObject.y = this.player.y + this.player.h * 2;

        if (this.player.combo > 1) this.textObject.color = this.dimColor;
        if (this.player.combo > 2) this.textObject.color = this.halfColor;
        if (this.player.combo > 4) this.textObject.color = this.fullColor;

        this.textObject.text = `Combo: ${this.player.combo}`;
        this.textObject.draw();
    }
}
