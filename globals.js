/** @type HTMLCanvasElement */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// I'm too used to my variables being named like this.
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const bgImage = new Image(WIDTH * 2, HEIGHT * 2);
// TODO make this background more amazing lol.
bgImage.src = "./static/img/amazing_background.png";

const camera = {
    x: 0,
    y: 0,
    w_scale: 1,
    h_scale: 1
};


function lerpCamera(objs) {
    // objs is an array of ScreenObjects

    // get midpounts
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
    camera.x = -midpoint.x + WIDTH / 2;
    camera.y = -midpoint.y + HEIGHT / 2;

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
            // get index for two farthest objects
            if (dataStorage[i][j] > largestDistance) {
                largestDistance = dataStorage[i][j];
                farthestObjs = [i, j];
            }
        }
    }

    // set the two farthest objects
    let obj1 = objs[farthestObjs[0]];
    let obj2 = objs[farthestObjs[1]];
    
    // OBJ 1 and OBJ 2 will be the two farthest objects
    scale = Math.min(((HEIGHT * Math.pow(0.86, objs.length)) / Math.abs(obj1.y - obj2.y)), ((WIDTH * Math.pow(0.86, objs.length)) / Math.abs(obj1.x - obj2.x)));

    if (scale > 1.75) {
        scale = 1.75;
    } else if (scale < 0.1) {
        scale = 0.1;
    }

    camera.w_scale = camera.w_scale - (camera.w_scale - scale) / 10;
    camera.h_scale = camera.h_scale - (camera.h_scale - scale) / 10;
}

const gameConsole = document.getElementById("console");
const GameConsole = {
    log: (msg, color="inherit") => {
        gameConsole.innerHTML += `<p>> <span style="color: ${color};">${msg}</span></p>`;
        gameConsole.scrollTop = gameConsole.scrollHeight; // autoscrolling
    },

    debug: (msg) => {
        GameConsole.log("[Debug]: " + msg, "#FF9900");
    }
}
