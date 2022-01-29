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


function lerpCamera(obj1, obj2) {
    // obj1 and obj2 are of type ScreenObject

    // get midpounts
    let midpoint = {
        x: ((obj1.x + obj2.x + obj1.w / 2 + obj2.w / 2) / 2),
        y: ((obj1.y + obj2.y + obj1.h / 2 + obj2.h / 2) / 2)
    };

    // move camera
    camera.x = -midpoint.x + WIDTH / 2;
    camera.y = -midpoint.y + HEIGHT / 2;

    // resize camera
    let scale = 1;
    //distance = Math.sqrt(((obj1.x - obj2.x) ^ 2) + ((obj1.y - obj2.y) ^ 2));

    scale = Math.min(((HEIGHT * 0.75) / Math.abs(obj1.y - obj2.y)), ((WIDTH * 0.75) / Math.abs(obj1.x - obj2.x)));

    if (scale > 2) {
        scale = 2;
    } else if (scale < 0.25) {
        scale = 0.25;
    }

    camera.w_scale = camera.w_scale - (camera.w_scale - scale) / 10;
    camera.h_scale = camera.h_scale - (camera.h_scale - scale) / 10;
}
