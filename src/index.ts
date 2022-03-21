import { WIDTH, HEIGHT, canvas, ctx, bgOrig, teamColors, GameConsole, lerpCamera, globalFrameLength, globalPhysicsTick } from './globals';
import { Button } from "./lib/std/Button";
import { Player } from "./lib/player/Player";
import { ScreenObject } from './lib/std/ScreenObject';
import { TextObject } from './lib/std/TextObject';
import { loadMap } from './maps';
import { Deathmatch, Ffa, Gamemode, Juggernaut, Stock } from './lib/game/Gamemode';
import { PowerUpBox } from './lib/game/PowerUpBox';

function main() {
    const playButton = new Button(WIDTH / 2 - 150, HEIGHT / 2 - 80, 300, 80, {
        inactive: "#0ad",
        active: "#0ef",
        pressed: "#aff"
    }, 10, "#555", "Start Game", [-110, 10], "#000", () => {
        // Start the game
        playButton.enabled = false;
        settingsButton.enabled = false;
        infoButton.enabled = false;
        if (document.getElementById("settings").style.display == "block") document.getElementById("settings").style.display = "none";
        clearInterval(process);
        startGame();
    }, "40px sans");

    const settingsButton = new Button(WIDTH / 2 - 150, HEIGHT / 2 + 40, 300, 80, {
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

    const infoButton = new Button(WIDTH / 2 - 150, HEIGHT / 2 + 160, 300, 80, {
        inactive: "#d0a",
        active: "#f0e",
        pressed: "#faf"
    }, 10, "#555", "Info", [-40, 10], "#000", () => {
        playButton.enabled = false;
        settingsButton.enabled = false;
        infoButton.enabled = false;
        if (document.getElementById("settings").style.display == "block") document.getElementById("settings").style.display = "none";
        clearInterval(process);
        showInfo();
    }, "40px sans");

    document.addEventListener("keydown", (e) => {
        if (e.key == "Enter" && playButton.enabled) {
            playButton.onClick();
        }
    });

    const playText = new TextObject(WIDTH / 2 - 70, playButton.y + 75, 400, 100, "Enter also works!", "#222", "16px sans");

    canvas.addEventListener("mousemove", (event) => {
        playButton.listenMouseMove(event);
        settingsButton.listenMouseMove(event);
        infoButton.listenMouseMove(event);
    });

    canvas.addEventListener("mousedown", (event) => {
        playButton.listenMouseDown(event);
        settingsButton.listenMouseDown(event);
        infoButton.listenMouseDown(event);
    });

    canvas.addEventListener("mouseup", (event) => {
        playButton.listenMouseUp(event);
        settingsButton.listenMouseUp(event);
        infoButton.listenMouseUp(event);
    });

    let frames = 0;
    const fpsText = document.getElementById("fpsCount");

    setInterval(() => {
        fpsText.innerHTML = `FPS: ${frames}`;
        frames = 0;
    }, 1000)

    let firstTime = true;
    let process = setInterval(mainMenu, globalFrameLength);

    function mainMenu() {
        if (firstTime) {
            ctx.fillStyle = "#0DF";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            ctx.drawImage(bgOrig, 0, 0, WIDTH, HEIGHT);
            firstTime = false;
        }

        if (!playButton.enabled) {
            playButton.enabled = true;
            settingsButton.enabled = true;
            infoButton.enabled = true;
        }

        playButton.draw();
        playText.draw();
        settingsButton.draw();
        infoButton.draw();

        // if (document.getElementById("idk").value == "idk") {
        //     document.getElementById("settings").style.display = "block";
        // } else {
        //     document.getElementById("settings").style.display = "none";
        // }

        frames++;
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
        process = setInterval(drawingGame, globalFrameLength);
        const gameLoop = setInterval(runGame, globalPhysicsTick);

        function runGame() {
            for (let i = 0; i < players.length; i++) {
                players[i].updatePhysics(platforms, powerUps);
            }

            for (let i = 0; i < powerUps.length; i++) {
                powerUps[i].updatePhysics();
            }

            if (Math.random() * 1500 < 1) {
                powerUps.push(new PowerUpBox(Math.random() * WIDTH * 2 + WIDTH / 2, Math.random() * HEIGHT * 2 + HEIGHT / 2));
                GameConsole.log("A Power Up has spawned!");
            }


            const playerScreenObjs = [];

            for (let i = 0; i < players.length; i++) {
                if (players[i].health.health > 0) {
                    playerScreenObjs.push(players[i].screenObject);
                }
            }

            lerpCamera(playerScreenObjs);

            if (gamemode.isGameOver()) {
                if (!gameOver) {
                    setTimeout(() => {
                        let whoWon = gamemode.whoWon();
                        GameConsole.log(`<span style="color: ${whoWon[1]};">${whoWon[0]}</span> won!`, "#FFFF00", true);

                        Player.playerCounter = 0;
                        Player.teamCounter = 4;
                        clearInterval(process);
                        clearInterval(gameLoop);
                        process = setInterval(mainMenu, globalFrameLength);
                    }, 1500);

                    gameOver = true;
                }
            }
        }

        function drawingGame() {
            // This function runs every frame
            ctx.clearRect(0, 0, WIDTH, HEIGHT);

            bg.draw();

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

            frames++;
        }
    }

    function showInfo() {
        const classNames = ["Default", "Berserk", "Tank", "Ninja", "Heavyweight", "Vampire", "Support"];
        const classColors = ["#0DF"];
        const classDescs = [
            [
                "This is the default class.",
                "There is nothing special here."
            ]
        ]; 

        let currentClass = 0;

        const border = new ScreenObject(50, 50, WIDTH - 100, HEIGHT - 100, "#333", false);
        const displayBox = new ScreenObject(100, 100, 400, HEIGHT - 200, classColors[currentClass], false);

        const platformThingy = new ScreenObject(150, 400, 300, 80, "#345", false);
        const playerShowcase = new ScreenObject(250, 340, 100, 100, "#f43", false);

        const textBorder = new ScreenObject(550, 100, 550, HEIGHT - 200, "#444", false);
        //const titleText = new TextObject(600, 200, 450, 100, classNames[currentClass], "#efefef", "60px sans");
        //const descText = new TextObject(600, 300, 450, 400, classDescs[currentClass], "#cfdfef", "30px sans")

        let done = false;
        process = setInterval(runRules, globalFrameLength);

        function runRules() {
            ctx.fillStyle = "#0DF";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            ctx.drawImage(bgOrig, 0, 0, WIDTH, HEIGHT);

            if (done) {
                clearInterval(process);
                process = setInterval(mainMenu, globalFrameLength)
            }

            while (currentClass >= classNames.length) {
                currentClass -= classNames.length;
            }

            // Run info drawing code here!
            border.draw();
            displayBox.color = classColors[currentClass] || "#000";
            displayBox.draw();

            platformThingy.draw();
            playerShowcase.draw();
            
            textBorder.draw();

            {
                ctx.fillStyle = "#efefef";
                ctx.font = "60px sans";
                ctx.fillText(classNames[currentClass], 600, 200, 450);
            }

            for (let i = 0; i < classDescs[currentClass].length; i++) {
                ctx.fillStyle = "#cfdfef";
                ctx.font = "20px sans";
                ctx.fillText(classDescs[currentClass][i], 600, 250 + 20 * i, 450);
            }

            frames++;
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
