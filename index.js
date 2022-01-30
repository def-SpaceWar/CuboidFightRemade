// TODO: Make powerup boxes spawn.
// TODO: Make a level with a bunch of platforms.
// TODO: Make a background image. (kinda done just need to fix the blur)

const player = new Player(
    100,
    100,
    75,
    75,
    "#f00", {
        left: "ArrowLeft",
        right: "ArrowRight",
        up: "ArrowUp",
        down: "ArrowDown",
        attack: "/"
    }
);

const player2 = new Player(
    1000,
    100,
    75,
    75,
    "#00f", {
        left: "a",
        right: "d",
        up: "w",
        down: "s",
        attack: "q"
    }
);

const player3 = new Player(
    550,
    100,
    75,
    75,
    "#0f0", {
        left: "4",
        right: "6",
        up: "8",
        down: "2",
        attack: "5"
    }
);

// We can use these "otherPlayer"s to MAKE TEAMS WHICH I JUST REALIZED!
player.otherPlayers.push(player2, player3);
player2.otherPlayers.push(player, player3);
player3.otherPlayers.push(player, player2);

const playersScreenObjs = [player.screenObject, player2.screenObject, player3.screenObject];

const platforms = [
    new Platform(
        400,
        800,
        100,
        20, {
            top: "#9f1",
            bottom: "#320"
        }
    ),

    new Platform(
        400,
        1000,
        100,
        20, {
            top: "#9f1",
            bottom: "#320"
        }
    ),

    new Platform(
        400,
        400,
        100,
        20, {
            top: "#9f1",
            bottom: "#320"
        }
    ),

    new Platform(
        100,
        HEIGHT,
        WIDTH - 200,
        20, {
            top: "#9f1",
            bottom: "#320"
        }
    ),

    new Platform(
        0,
        HEIGHT * 2,
        WIDTH * 2,
        20, {
            top: "#9f1",
            bottom: "#320"
        }
    ),
]

const powerUps = [];

const button = new Button(100, 100, 300, 80, {
    inactive: "#0ad",
    active: "#0ef",
    pressed: "#aff"
}, 10, "#555", "Hi", [-25, 10], "#000", () => setTimeout(() => console.log("Hi"), 5000), "40px 'Comic Sans MS'");

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
    player3.listenKeyDown(event);
});

document.addEventListener("keyup", (event) => {
    player.listenKeyUp(event);
    player2.listenKeyUp(event);
    player3.listenKeyUp(event);
});

function update() {
    // This function runs every frame
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    player3.updatePhysics(platforms, powerUps);
    player2.updatePhysics(platforms, powerUps);
    player.updatePhysics(platforms, powerUps);

    //ctx.drawImage(
    //    bgImage,
    //    (-WIDTH / 2 + camera.x) * camera.w_scale - WIDTH * (camera.w_scale - 1) / 2,
    //    (-HEIGHT / 2 + camera.y) * camera.h_scale - HEIGHT * (camera.h_scale - 1) / 2,
    //    WIDTH * 2 * camera.w_scale,
    //    HEIGHT * 2 * camera.h_scale
    //);

    if (Math.random() * 500 > 499) {
        powerUps.push(new PowerUpBox(Math.random() * 800 + 200, Math.random() * 600 + 400));
    }

    for (let i = 0; i < platforms.length; i++) {
        platforms[i].draw();
    }

    for (let i = 0; i < powerUps.length; i++) {
        powerUps[i].draw();
    }

    player3.draw();
    player2.draw();
    player.draw();
    //button.draw();

    for (let i = 0; i < playersScreenObjs.length; i++) {
        if (playersScreenObjs[i].y > HEIGHT * 3) {
            playersScreenObjs.splice(i, 1);
        }
    }

    lerpCamera(playersScreenObjs);

    player3.health.draw();
    player2.health.draw();
    player.health.draw();
}

setInterval(update, 20);
