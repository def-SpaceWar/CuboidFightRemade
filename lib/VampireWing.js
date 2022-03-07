class VampireWing {
  constructor(player, isLeft=true) {
    this.player = player;

    this.isLeft = isLeft;
    this.angleMult = 0;
    if (isLeft) {
      this.image = vampireLeftWingTexture;
      this.angleMult = -1;
    } else {
      this.image = vampireRightWingTexture;
      this.angleMult = 1;
    }

    this.screenObject = new ScreenObject(0, 0, player.w * 1.25, player.h * 1.25, "#000000");
    this.screenObject.image = this.image;
  }

  draw() {
    if (this.isLeft) {
      this.screenObject.x = this.player.x - this.player.w * 1.25 + this.player.w / 4;
    } else {
      this.screenObject.x = this.player.x + this.player.w - this.player.w / 4;
    }

    this.screenObject.y = this.player.y - this.player.h / 8;

    if (!this.player.grounded) {
      if (this.player.forces[2].y >= this.player.jumpPower / 2) {
        this.screenObject.angle += 10 * this.angleMult;

        if (this.screenObject.angle * this.angleMult > 25) {
          this.screenObject.angle = 25 * this.angleMult;
        }
      } else {
        this.screenObject.angle -= 1 * this.angleMult;

        if (this.screenObject.angle * this.angleMult < -15) {
          this.screenObject.angle = -15 * this.angleMult;
        }
      }
    } else {
      if (Math.abs(this.screenObject.angle) > 1) {
        this.screenObject.angle /= 2;
      } else {
        this.screenObject.angle = 0;
      }
    }

    this.screenObject.draw();
  }
}
