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
            ctx.drawImage(bgOrig, 0, 0, WIDTH, HEIGHT);
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
                attack: "/",
                special: "."
            }
        );

        const player2 = new Player(
            0,
            0,
            75,
            75,
            ["#09f", "#058"], {
                left: "s",
                right: "f",
                up: "e",
                down: "d",
                attack: "q",
                special: "w"
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
                attack: " ",
                special: "c"
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
                attack: "7",
                special: "1"
            }
        );

        player1.otherPlayers.push(player2, player3, player4);
        player2.otherPlayers.push(player1, player3, player4);
        player3.otherPlayers.push(player1, player2, player4);
        player4.otherPlayers.push(player1, player2, player3);

        const players = [player1, player2, player3, player4];
        const teamsEnabled = localStorage.getItem("teamenable");
        console.log(teamsEnabled);

        // each team has its own color
        const teamColors = ["#990000", "#999900", "#009900", "#000099"];

        if (teamsEnabled != "false") {
            // set player's shadow to white indicating it has no team
            for (let p = 0; p < players.length; p++) {
                players[p].screenObject.shadowColor = "#AAAAAA";
            }

            // Team Code (set everyone on their teams)
            for (let i = 1; i < 4; i++) {
                if (localStorage.getItem(`team${i}`)) {
                    let playersOnTeam = localStorage.getItem(`team${i}`).split(",");

                    for (let j = 0; j < playersOnTeam.length; j++) {
                        for (let k = 0; k < players.length; k++) {
                            if (playersOnTeam[j] == players[k].playerNum) {
                                players[k].team = i;
                                players[k].screenObject.shadowColor = teamColors[i - 1];
                            }
                        }
                    }
                }
            }
        }

        const platforms = loadMap(1, players);
        const powerUps = [];

        const bg = new ScreenObject(
            -WIDTH,
            -HEIGHT,
            WIDTH * 5,
            HEIGHT * 5,
            "#FF0000"
        );

        bg.image = bgImage;

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

            for (let i = 0; i < players.length; i++) {
                players[i].health.draw();
            }

            if (playerScreenObjs.length == 1) {
                // Go to win screen

                for (let i = 0; i < players.length; i++) {
                    if (players[i].health.health > 0) {
                        if (!gameOver) {
                            setTimeout(() => {
                                if (players[i].health.health > 0) {
                                    GameConsole.log(`<span style="color: ${players[i].color};">[Player ${players[i].playerNum}]</span> won!`, "#FFFF00", true);
                                } else {
                                    GameConsole.log(`It's a tie!`, "#FFFF00", true);
                                }

                                playerCounter = 0;
                                teamCounter = 4;
                                clearInterval(process);
                                process = setInterval(mainMenu, 15);
                            }, 1500);

                            gameOver = true;
                        }
                    }
                }
            }

            if (teamsEnabled) {
                let teamsAlive = [];

                for (let i = 0; i < players.length; i++) {
                    if (players[i].health.health > 0 &&
                        teamsAlive.indexOf(players[i].team) == -1) {
                        teamsAlive.push(players[i].team);
                    }
                }

                if (teamsAlive.length <= 1) {
                    if (teamsAlive[0] < 5) {
                        if (!gameOver) {
                            setTimeout(() => {
                                if (teamsAlive.length > 0) {
                                    GameConsole.log(`<span style="color: ${teamColors[teamsAlive[0] - 1]};">[Team ${teamsAlive[0]}]</span> won!`, "#FFFF00", true);
                                } else {
                                    GameConsole.log(`It's a tie!`, "#FFFF00", true);
                                }

                                playerCounter = 0;
                                teamCounter = 4;
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
