const player = new Player(
    100,
    100,
    75,
    75,
    ["#f43", "#821"], {
        left: "ArrowLeft",
        right: "ArrowRight",
        up: "ArrowUp",
        down: "ArrowDown",
        attack: "/"
    }
);

const player2 = new Player(
    400,
    100,
    75,
    75,
    ["#09f", "#058"], {
        left: "a",
        right: "d",
        up: "w",
        down: "s",
        attack: "q"
    }
);

const player3 = new Player(
    700,
    100,
    75,
    75,
    ["#3f4", "#182"], {
        left: "v",
        right: "n",
        up: "g",
        down: "b",
        attack: " "
    }
);

const player4 = new Player(
    1000,
    100,
    75,
    75,
    ["#ff4", "#ba2"], {
        left: "4",
        right: "6",
        up: "8",
        down: "5",
        attack: "7"
    }
);

// We can use these "otherPlayer"s to MAKE TEAMS WHICH I JUST REALIZED!
player.otherPlayers.push(player2, player3, player4);
player2.otherPlayers.push(player, player3, player4);
player3.otherPlayers.push(player, player2, player4);
player4.otherPlayers.push(player, player2, player3);

const players = [player, player2, player3, player4];

let done = false;
while (!done) {
    done = true;
    for (let i = 0; i < players.length; i++) {
        if (localStorage.getItem(`player${i + 1}enable`) == "false") {
            players[i].x = -1000;
            players[i].y = -1000;
            players.splice(i, 1);
            done = false;
        }
    }
}


const platforms = [
    new Platform(
        400,
        800,
        100,
        40, {
            top: "#9f1",
            bottom: "#320"
        }
    ),

    new Platform(
        400,
        1000,
        100,
        40, {
            top: "#9f1",
            bottom: "#320"
        }
    ),

    new Platform(
        400,
        400,
        100,
        40, {
            top: "#9f1",
            bottom: "#320"
        }
    ),

    new Platform(
        100,
        HEIGHT,
        WIDTH - 200,
        40, {
            top: "#9f1",
            bottom: "#320"
        }
    ),

    new Platform(
        0,
        HEIGHT * 2,
        WIDTH * 2,
        40, {
            top: "#AAA",
            bottom: "#666"
        },
        true
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
    for (let i = 0; i < players.length; i++) {
        players[i].listenKeyDown(event);
    }
});

document.addEventListener("keyup", (event) => {
    for (let i = 0; i < players.length; i++) {
        players[i].listenKeyUp(event);
    }
});

function update() {
    // This function runs every frame
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const playerScreenObjs = [];

    for (let i = 0; i < players.length; i++) {
        if (players[i].health.health > 0) {
            playerScreenObjs.push(players[i].screenObject);
        }
    }

    lerpCamera(playerScreenObjs);

    for (let i = 0; i < players.length; i++) {
        players[i].updatePhysics(platforms, powerUps);
    }

    // this needs to be rendered with depth at some point
    ctx.drawImage(
        bgImage,
        (-WIDTH / 2 + camera.x) * camera.w_scale - WIDTH * (camera.w_scale - 1) / 2,
        (-HEIGHT / 2 + camera.y) * camera.h_scale - HEIGHT * (camera.h_scale - 1) / 2,
        WIDTH * 3 * camera.w_scale,
        HEIGHT * 3 * camera.h_scale
    );

    if (Math.random() * 1500 > 1499) {
        powerUps.push(new PowerUpBox(Math.random() * 800 + 200, Math.random() * 600 + 400));
    }

    for (let i = 0; i < platforms.length; i++) {
        platforms[i].draw();
    }

    for (let i = 0; i < powerUps.length; i++) {
        powerUps[i].draw();
    }

    for (let i = 0; i < players.length; i++) {
        players[i].draw();
    }

    // button.draw();

    //for (let i = 0; i < players.length; i++) {
    //    if (players[i].health.health <= 0) {
    //        players.splice(i, 1);
    //    }
    //}

    for (let i = 0; i < players.length; i++) {
        players[i].health.draw();
    }

    if (document.getElementById("idk").value == "idk") {
        document.getElementById("settings").style.display = "block";
    }

    if (document.getElementById("idk").value == "no") {
        document.getElementById("settings").style.display = "none";
    }
}

setInterval(update, 15);
