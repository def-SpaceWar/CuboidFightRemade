import { WIDTH, HEIGHT, canvas, ctx, bgOrig, teamColors, GameConsole, lerpCamera } from './globals';
import { Button } from "./lib/std/Button";
import { Player } from "./lib/player/Player";
import { ScreenObject } from './lib/std/ScreenObject';
import { TextObject } from './lib/std/TextObject';
import { loadMap } from './maps';
import { Deathmatch, Ffa, Gamemode, Juggernaut, Stock } from './lib/game/Gamemode';
import { PowerUpBox } from './lib/game/PowerUpBox';

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

    const playText = new TextObject(WIDTH / 2 - 70, HEIGHT / 2 + 33, 400, 100, "Enter also works!", "#222", "16px sans");

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
        playText.draw();
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
        let teamsEnabled = localStorage.getItem("teamenable");

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
                            if (parseInt(playersOnTeam[j]) == players[k].playerNum) {
                                players[k].team = i;
                                players[k].screenObject.shadowColor = teamColors[i - 1];
                            }
                        }
                    }
                }
            }
        }

        const data = loadMap(1, players);

        const platforms = data[0];
        const powerUps: PowerUpBox[] = [];

        const bg = new ScreenObject(
            -WIDTH,
            -HEIGHT,
            WIDTH * 5,
            HEIGHT * 5,
            "#FF0000"
        );

        bg.image = data[1];

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

        let gamemode = new Gamemode(players, !!teamsEnabled);
        
        switch (localStorage.getItem("gamemode")) {
            case "ffa":
                gamemode = new Ffa(players, !!teamsEnabled);
                break;
            case "deathmatch":
                gamemode = new Deathmatch(players, !!teamsEnabled);
                break;
            case "stock":
                gamemode = new Stock(players, !!teamsEnabled);
                break;
            case "juggernaut":
                teamsEnabled = "true";
                gamemode = new Juggernaut(players, !!teamsEnabled);
                break;
            default:
                gamemode = new Ffa(players, !!teamsEnabled);
                break;
        }

        gamemode.setup();

        let gameOver = false;
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

            if (gamemode.isGameOver()) {
                if (!gameOver) {
                    setTimeout(() => {
                        let whoWon = gamemode.whoWon();
                        GameConsole.log(`<span style="color: ${whoWon[1]};">${whoWon[0]}</span> won!`, "#FFFF00", true);

                        Player.playerCounter = 0;
                        Player.teamCounter = 4;
                        clearInterval(process);
                        process = setInterval(mainMenu, 15);
                    }, 1500);

                    gameOver = true;
                }
            }
        }
    }
}

ctx.fillStyle = "#00FFFF";
ctx.fillRect(0, 0, WIDTH, HEIGHT);

ctx.fillStyle = "black";
ctx.font = "100px sans";
ctx.fillText(
    "Loading...",
    WIDTH / 2 - 200,
    HEIGHT / 2 + 50,
    800
);

setTimeout(main, 2000);
