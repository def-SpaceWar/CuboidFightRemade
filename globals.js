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
