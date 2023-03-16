import { WIDTH, HEIGHT, canvas, ctx, bgOrig, teamColors, GameConsole, lerpCamera, globalFrameLength, globalPhysicsTick, vampireLeftWingTexture, vampireRightWingTexture } from './globals';
import { Button } from "./lib/std/Button";
import { Player } from "./lib/player/Player";
import { ScreenObject } from './lib/std/ScreenObject';
import { TextObject } from './lib/std/TextObject';
import { loadMap } from './maps';
import { Deathmatch, Ffa, Gamemode, Juggernaut, Stock } from './lib/game/Gamemode';
import { PowerUpBox } from './lib/game/PowerUpBox';

window.onload = () => {
  let process: number | NodeJS.Timer = -1;

  let player1: Player,
    player2: Player,
    player3: Player,
    player4: Player;

  let frames = 0;
  const fpsText = document.getElementById("fpsCount");

  setInterval(() => {
    fpsText.innerHTML = `FPS: ${frames}`;
    frames = 0;
  }, 1000);

  const setCustomInterval = (callBack: () => any) => {
    if (globalFrameLength > 0) return setInterval(callBack, globalFrameLength);
    const newCallback = () => {
      process = requestAnimationFrame(newCallback);
      callBack();
    }
    return requestAnimationFrame(newCallback);
  };

  const clearCustomInterval = (id: number | NodeJS.Timer) => {
    if (globalFrameLength > 0) clearInterval(id as NodeJS.Timer);
    cancelAnimationFrame(id as number);
  }

  //ctx.webkitImageSmoothingEnabled = false;
  //ctx.mozImageSmoothingEnabled = false;
  //ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  // loading screen is now useless because multiplayer implementation couldn't be done.
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

  // start game immediately
  (() => {
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
      clearCustomInterval(process);
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
      clearCustomInterval(process);
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

    process = setCustomInterval(mainMenu);

    let firstTime = true;
    function mainMenu() {
      if (firstTime) {
        ctx.fillStyle = "#0DF";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.drawImage(bgOrig, 0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = "#09f";
        ctx.strokeStyle = "#3f4";
        ctx.lineWidth = 3;
        ctx.font = "120px Comic Sans MS";
        ctx.fillText("Cuboid Fight!", WIDTH / 2 - 365, 120);
        ctx.strokeText("Cuboid Fight!", WIDTH / 2 - 365, 120);

        ctx.fillStyle = "#ff4";
        ctx.strokeStyle = "#f43";
        ctx.lineWidth = 3;
        ctx.font = "90px Comic Sans MS";
        ctx.fillText("Remade", WIDTH / 2 - 165, 160);
        ctx.strokeText("Remade", WIDTH / 2 - 165, 160);
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

      frames++;
    }

    function startGame() {
      player1 = new Player(
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

      player2 = new Player(
        0,
        0,
        75,
        75,
        ["#09f", "#058"], {
        left: "s",
        right: "f",
        up: "e",
        down: "d",
        attack: "w",
        special: "q"
      }
      );

      player3 = new Player(
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

      player4 = new Player(
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

      const data = loadMap(parseInt(localStorage.getItem("map")) || 1, players);

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

      let running = true;
      while (running) {
        running = false;
        for (let i = 0; i < players.length; i++) {
          if (localStorage.getItem(`player${i + 1}enable`) == "false") {
            players[i].x = -1000;
            players[i].y = -1000;
            players.splice(i, 1);
            running = true;
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

      clearCustomInterval(process);
      process = setCustomInterval(drawingGame);
      const gameLoop = setInterval(runGame, globalPhysicsTick);

      function runGame() {
        // runs every physics update
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


        const playerScreenObjs: ScreenObject[] = [];

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

              clearCustomInterval(process);
              process = setCustomInterval(mainMenu);
              clearInterval(gameLoop);
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
      showClasses();

      function showRules() {
        let pageIdx = 0;

        const nextButton = new Button(
          WIDTH - 75, HEIGHT - 75, 55, 55,
          { inactive: "#999", active: "#CCC", pressed: "#FFF" },
          10,
          "#555",
          ">",
          [-25, 25],
          "#333",
          () => { pageIdx++; },
          "100px monospace"
        );

        const prevButton = new Button(
          20, HEIGHT - 75, 55, 55,
          { inactive: "#999", active: "#CCC", pressed: "#FFF" },
          10,
          "#555",
          "<",
          [-30, 25],
          "#333",
          () => { pageIdx--; },
          "100px monospace"
        );

        let done = false;
        const exitButton = new Button(
          WIDTH - 75, 20, 55, 55,
          { inactive: "#F00", active: "#F55", pressed: "#F99" },
          10,
          "#555",
          "x",
          [-28, 20],
          "#333",
          () => { done = true; },
          "100px monospace"
        );

        clearCustomInterval(process);
        process = setCustomInterval(runRules);

        function runRules() { }
      }

      function showClasses() {
        const border = new ScreenObject(50, 50, WIDTH - 100, HEIGHT - 100, "#333", false);
        const displayBox = new ScreenObject(100, 100, 400, HEIGHT - 200, classColors[classIdx], false);

        const platformThingy = new ScreenObject(150, 400, 300, 80, "#345", false);
        const playerShowcase = new ScreenObject(250, 340, 100, 100, "#f43", false);

        const nextButton = new Button(
          WIDTH - 75, HEIGHT - 75, 55, 55,
          { inactive: "#999", active: "#CCC", pressed: "#FFF" },
          10,
          "#555",
          ">",
          [-25, 25],
          "#333",
          () => { classIdx++; },
          "100px monospace"
        );

        const prevButton = new Button(
          20, HEIGHT - 75, 55, 55,
          { inactive: "#999", active: "#CCC", pressed: "#FFF" },
          10,
          "#555",
          "<",
          [-30, 25],
          "#333",
          () => { classIdx--; },
          "100px monospace"
        );

        let done = false;
        const exitButton = new Button(
          WIDTH - 75, 20, 55, 55,
          { inactive: "#F00", active: "#F55", pressed: "#F99" },
          10,
          "#555",
          "x",
          [-28, 20],
          "#333",
          () => { done = true; },
          "100px monospace"
        );

        document.addEventListener("mousemove", (e: MouseEvent) => {
          nextButton.listenMouseMove(e);
          prevButton.listenMouseMove(e);
          exitButton.listenMouseMove(e);
        });

        document.addEventListener("mousedown", (e: MouseEvent) => {
          nextButton.listenMouseDown(e);
          prevButton.listenMouseDown(e);
          exitButton.listenMouseDown(e);
        });

        document.addEventListener("mouseup", (e: MouseEvent) => {
          nextButton.listenMouseUp(e);
          prevButton.listenMouseUp(e);
          exitButton.listenMouseUp(e);
        });

        const textBorder = new ScreenObject(550, 100, 550, HEIGHT - 200, "#444", false);

        process = setCustomInterval(runClasses);

        function runClasses() {
          if (done) {
            clearCustomInterval(process);
            process = setCustomInterval(mainMenu)
          }

          ctx.fillStyle = "#0DF";
          ctx.fillRect(0, 0, WIDTH, HEIGHT);
          ctx.drawImage(bgOrig, 0, 0, WIDTH, HEIGHT);

          if (classIdx < 0) classIdx += classNames.length;
          classIdx = classIdx % classNames.length;

          // Run info drawing code here!
          border.draw();
          displayBox.color = classColors[classIdx] || "#000";
          displayBox.draw();

          platformThingy.draw();
          if (classIdx == PlayerClass.Vampire) {
            ctx.drawImage(vampireLeftWingTexture, playerShowcase.x - 100, playerShowcase.y, 100, 100);
            ctx.drawImage(vampireRightWingTexture, playerShowcase.x + 100, playerShowcase.y, 100, 100);
          }
          if (classIdx == PlayerClass.Juggernaut) {
            ctx.fillStyle = playerShowcase.color;
            ctx.fillRect(
              playerShowcase.x - (playerShowcase.w * 0.2),
              playerShowcase.y - (playerShowcase.h * 0.4),
              playerShowcase.w * 1.4,
              playerShowcase.h * 1.4
            );
          } else {
            playerShowcase.draw();
          }

          nextButton.draw();
          prevButton.draw();
          exitButton.draw();

          textBorder.draw();

          ctx.fillStyle = "#efefef";
          ctx.font = "60px sans";
          ctx.fillText(classNames[classIdx], 600, 200, 450);

          for (let i = 0; i < classDescs[classIdx].length; i++) {
            ctx.fillStyle = classDescs[classIdx][i][1] || "#cfdfef";
            ctx.font = classDescs[classIdx][i][2] || "20px sans";
            ctx.fillText(classDescs[classIdx][i][0], 600, 250 + 20 * i, 450);
          }

          frames++;
        }
      }
    }
  })();
};
