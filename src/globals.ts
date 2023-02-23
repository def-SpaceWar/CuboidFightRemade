import { ScreenObject } from "./lib/std/ScreenObject";

export const canvas = document.getElementById("canvas") as HTMLCanvasElement;
export const ctx = canvas.getContext("2d");

// each team has its own color
export const teamColors = ["#990000", "#999900", "#009900", "#000099"];

// I'm too used to my variables being named like this.
export const WIDTH = canvas.width;
export const HEIGHT = canvas.height;

export const camera = {
  x: 0,
  y: 0,
  w_scale: 1,
  h_scale: 1
};

export const globalFrameLength = (1000 / parseInt(localStorage.getItem("fpslimit"))) || 0; // VSync or choose
export const globalPhysicsTick = 20; // Physics reloads every 20 milliseconds

export function lerpCamera(objs: ScreenObject[]) {
  let midpoint = {
    x: 0,
    y: 0
  };

  let xAverage = 0;
  let yAverage = 0;

  for (let i = 0; i < objs.length; i++) {
    xAverage += objs[i].x + objs[i].w / 2;
    yAverage += objs[i].y + objs[i].h / 2;
  }

  midpoint.x = xAverage / objs.length;
  midpoint.y = yAverage / objs.length;

  // move camera
  camera.x = (camera.x + midpoint.x) / 2;
  camera.y = (camera.y + midpoint.y) / 2;

  // resize camera
  let scale = 1;
  //distance = Math.sqrt(((obj1.x - obj2.x) ^ 2) + ((obj1.y - obj2.y) ^ 2));

  // OBJ 1 and OBJ 2 will be the two farthest objects
  let dataStorage = [];

  for (let i = 0; i < objs.length; i++) {
    dataStorage.push([]);

    for (let j = i + 1; j < objs.length; j++) {
      // find distance between objects
      dataStorage[i][j] = Math.sqrt(Math.pow(objs[i].x - objs[j].x, 2) + Math.pow(objs[i].y - objs[j].y, 2));
    }
  }

  let largestDistance = 0;
  let farthestObjs = [0, 0];

  for (let i = 0; i < objs.length; i++) {
    for (let j = i + 1; j < objs.length; j++) {
      // @ts-ignore: Object is possibly 'undefined'
      if (dataStorage[i][j] > largestDistance) {
        largestDistance = dataStorage[i][j];
        // get index for two farthest objects
        farthestObjs = [i, j];
      }
    }
  }

  try {
    // set the two farthest objects
    let obj1 = objs[farthestObjs[0]];
    let obj2 = objs[farthestObjs[1]];

    // OBJ 1 and OBJ 2 will be the two farthest objects
    scale = Math.min(((HEIGHT * Math.pow(0.86, objs.length)) / Math.abs(obj1.y - obj2.y)), ((WIDTH * Math.pow(0.86, objs.length)) / Math.abs(obj1.x - obj2.x)));

    if (scale > 1.5) {
      scale = 1.5;
    } else if (scale < 0.05) {
      scale = 0.05;
    }

    if (Math.abs(camera.w_scale - scale) < 0.01) {
      camera.w_scale = scale;
      camera.h_scale = scale;
    } else {
      camera.w_scale = (camera.w_scale + scale) / 2;
      camera.h_scale = (camera.h_scale + scale) / 2;
    }
  } catch (e) {
    camera.x = WIDTH * 1.5;
    camera.y = HEIGHT * 1.5;
    camera.w_scale = 0.19;
    camera.h_scale = 0.19;
  }
}

const gameConsole = document.getElementById("console") as HTMLElement;
export const GameConsole = {
  log: (msg: string, color = "inherit", bold = false) => {
    if (!bold) {
      gameConsole.innerHTML += `<p>> <span style="color: ${color};">${msg}</span></p>`;
    } else {
      gameConsole.innerHTML += `<p>> <span style="color: ${color}; font-weight: bold;">${msg}</span></p>`;
    }
    gameConsole.scrollTop = gameConsole.scrollHeight; // autoscrolling
  },

  debug: (msg: string) => {
    GameConsole.log("[Debug]: " + msg, "#FF9900");
  },

  clear: () => {
    gameConsole.innerHTML = `<h1>Console:</h1>`;
  }
}

// Credit goes to @YutYouGit on github
export const bgOrig = new Image();
bgOrig.src = "./static/img/bg1.png";

export const ditherTexture = new Image();
ditherTexture.src = "./static/img/dithertexture.png";

export const deadlyTexture = new Image();
deadlyTexture.src = "./static/img/deadlytexture.png";

export const grassTexture = new Image();
grassTexture.src = "./static/img/grasstexture.png";

export const powerUpBoxTexture1 = new Image();
powerUpBoxTexture1.src = "./static/img/powerupbox1.png";

export const vampireLeftWingTexture = new Image();
vampireLeftWingTexture.src = "./static/img/vampireleftwing.png";

export const vampireRightWingTexture = new Image();
vampireRightWingTexture.src = "./static/img/vampirerightwing.png";
