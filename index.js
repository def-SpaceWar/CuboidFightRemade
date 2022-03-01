function main() {
    const playButton = new Button(WIDTH / 2 - 150, HEIGHT / 2 - 40, 300, 80, {
        inactive: "#0ad",
        active: "#0ef",
        pressed: "#aff"
    }, 10, "#555", "Start Game", [-110, 10], "#000", () => {
        // Start the game
        playButton.enabled = false;
        settingsButton.enabled = false;
        if (document.getElementById("settings").style.display == "block") document.getElementById("settings").style.display = "none";
        clearInterval(process);
        startGame();
    }, "40px sans");

    const settingsButton = new Button(WIDTH / 2 - 150, HEIGHT / 2 + 80, 300, 80, {
        inactive: "#da0",
        active: "#fe0",
        pressed: "#ffa"
    }, 10, "#555", "Settings", [-80, 10], "#000", () => {
        if (document.getElementById("settings").style.display == "block") {
            document.getElementById("settings").style.display = "none";
        } else {
            document.getElementById("settings").style.display = "block";
        }
    }, "40px sans");

    document.addEventListener("keydown", (e) => {
        if (e.key == "Enter" && playButton.enabled) {
            playButton.onClick();
        }
    });

    const textObject = new TextObject(WIDTH / 2 - 70, HEIGHT / 2 + 33, 400, 100, "Enter also works!", "#222", "16px sans");

    canvas.addEventListener("mousemove", (event) => {
        playButton.listenMouseMove(event);
        settingsButton.listenMouseMove(event);
    });

    canvas.addEventListener("mousedown", (event) => {
        playButton.listenMouseDown(event);
        settingsButton.listenMouseDown(event);
    });

    canvas.addEventListener("mouseup", (event) => {
        playButton.listenMouseUp(event);
        settingsButton.listenMouseUp(event);
    });

    let firstTime = true;
    let process = setInterval(mainMenu, 15);

    function mainMenu() {
        if (firstTime) {
            ctx.fillStyle = "#0DF";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            ctx.drawImage(bgImage, 0, 0, WIDTH, HEIGHT);
            firstTime = false;
        }

        playButton.enabled = true;
        settingsButton.enabled = true;
        playButton.draw();
        textObject.draw();
        settingsButton.draw();


        // if (document.getElementById("idk").value == "idk") {
        //     document.getElementById("settings").style.display = "block";
        // } else {
        //     document.getElementById("settings").style.display = "none";
        // }
    }

    function startGame() {
        const bg = new ScreenObject(
            -WIDTH,
            -HEIGHT,
            WIDTH * 5,
            HEIGHT * 5,
            "#FF0000"
        );

        bg.image = bgImage;

        const player1 = new Player(
            0,
            0,
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
            0,
            0,
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
            0,
            0,
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
            0,
            0,
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
        player1.otherPlayers.push(player2, player3, player4);
        player2.otherPlayers.push(player1, player3, player4);
        player3.otherPlayers.push(player1, player2, player4);
        player4.otherPlayers.push(player1, player2, player3);

        const players = [player1, player2, player3, player4];

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

        const platforms = loadMap(map1, players);

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

        const powerUps = [];

        gameOver = false;
        GameConsole.clear();
        process = setInterval(runningGame, 15);

        function runningGame() {
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

            bg.draw();

            if (Math.random() * 1500 < 1) {
                powerUps.push(new PowerUpBox(Math.random() * WIDTH * 2 + WIDTH / 2, Math.random() * HEIGHT * 2 + HEIGHT / 2));
                GameConsole.log("A Power Up has spawned!");
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

            //for (let i = 0; i < players.length; i++) {
            //    if (players[i].health.health <= 0) {
            //        players.splice(i, 1);
            //    }
            //}

            for (let i = 0; i < players.length; i++) {
                players[i].health.draw();
            }

            if (playerScreenObjs.length == 1) {
                // Go to win screen

                for (let i = 0; i < players.length; i++) {
                    if (players[i].health.health > 0) {
                        if (!gameOver) {
                            setTimeout(() => {
                                GameConsole.log(`<span style="color: ${players[i].color};">[Player ${players[i].playerNum}]</span> won!`, "#FFFF00", true);
                                playerCounter = 0;
                                clearInterval(process);
                                process = setInterval(mainMenu, 15);
                            }, 1500);

                            gameOver = true;
                        }
                    }
                }
            }
        }
    }
}

main();
