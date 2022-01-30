// TODO: Make double jumping! (done kinda)
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
        attack: "m"
    }
);

const player2 = new Player(
    1000,
    100,
    75,
    75,
    "#00f", {
        left: "s",
        right: "f",
        up: "e",
        down: "d",
        attack: "q"
    }
);

// We can use these "otherPlayer"s to MAKE TEAMS WHICH I JUST REALIZED!
player.otherPlayers.push(player2);
player2.otherPlayers.push(player);

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
});

document.addEventListener("keyup", (event) => {
    player.listenKeyUp(event);
    player2.listenKeyUp(event);
});

function update() {
    // This function runs every frame
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    player2.updatePhysics(platforms);
    player.updatePhysics(platforms);

    //ctx.drawImage(
    //    bgImage,
    //    (-WIDTH / 2 + camera.x) * camera.w_scale - WIDTH * (camera.w_scale - 1) / 2,
    //    (-HEIGHT / 2 + camera.y) * camera.h_scale - HEIGHT * (camera.h_scale - 1) / 2,
    //    WIDTH * 2 * camera.w_scale,
    //    HEIGHT * 2 * camera.h_scale
    //);

    for (let i = 0; i < platforms.length; i++) {
        platforms[i].draw();
    }

    player2.draw();
    player.draw();
    //button.draw();

    lerpCamera(player.screenObject, player2.screenObject);

    player2.health.draw();
    player.health.draw();
}

setInterval(update, 20);
