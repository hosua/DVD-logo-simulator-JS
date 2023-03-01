const CANVAS_W = 1280;
const CANVAS_H = 720;
const LOGO_W = 235;
const LOGO_H = 102;
const LOGO_VEL = 2.05; // Best speed 2.05
// const LOGO_VEL = 20; 
const SCALE = 1;
const LOGO_FILE = 'assets/dvd-logo.png'

// Get the canvas element
var canvas = document.getElementById("canvas");
canvas.width = CANVAS_W * SCALE;
canvas.height = CANVAS_H * SCALE;

// Get the 2D rendering context
var ctx = canvas.getContext("2d");

// buffer canvas for temporarily storing a copy of the DVD logo so that its colors can be modified 
var buffer_canvas = document.createElement("canvas");
// var buffer_canvas = document.getElementById("buffer-canvas"); 
buffer_canvas.style.width = LOGO_W + 'px';
buffer_canvas.style.height = LOGO_H + 'px';
buffer_canvas.width = LOGO_W;
buffer_canvas.height = LOGO_H;

// The context to handle modifying the DVD logo.
var buffer_ctx = buffer_canvas.getContext("2d", { willReadFrequently: true }); 

// Image initializaon should be done here and not in the object because JavaScript is stupid
var ORIGINAL_IMG = new Image();
ORIGINAL_IMG.src = LOGO_FILE;
buffer_ctx.drawImage(ORIGINAL_IMG,0,0,LOGO_W,LOGO_H);
const ORIGINAL_IMG_DATA = buffer_ctx.getImageData(0,0,LOGO_W,LOGO_H); // Store original image data for color randomizer to use
buffer_ctx.clearRect(0,0,this.w,this.h);

let counter = document.getElementById("corner-bounce-counter");
let corner_bounce_count = 0;

class DVDLogo {
	constructor(x, y, w, h, vel){
		this.x=x;
		this.y=y;
		this.w=w;
		this.h=h;
		this.vel=vel;
		this.x_dir=1;
		this.y_dir=1;
		this.img = new Image();
		this.img.src = LOGO_FILE;
	}

	setRandomColor(){
		// Store the bytes of the original image into an array 
		this.img_data = ORIGINAL_IMG_DATA

		// Randomize (r,g,b) parameters
		const r = Math.floor(Math.random() * 255);
		const g = Math.floor(Math.random() * 255);
		const b = Math.floor(Math.random() * 255);
		// console.log(`Setting color to: (${r},${g},${b})`);
		
		// In the bytes array, all r,g,b,a data are in chunks of 4 bytes.
		for (let i = 0; i < this.img_data.data.length; i += 4) {
		 	this.img_data.data[i] = r; // set r part of chunk
		 	this.img_data.data[i+1] = g; // set g part of chunk
		 	this.img_data.data[i+2] = b; // set b part of chunk
			// ignore a part of chunk
		}
		// Store the new, modified image into the buffer
		buffer_ctx.putImageData(this.img_data, 0, 0)

		// Set this DVDLogo object's image to the new image
		this.img.src = buffer_canvas.toDataURL();

		// Clear the buffer of the image for the next call
		buffer_ctx.clearRect(0,0,this.w,this.h);
	}

	renderToCanvas(){
		ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
	}

	update(){
		var x_flag = false;
		var y_flag = false;
		// Flip direction if out of bounds
		if (this.x + this.w > canvas.width || this.x < 0) {
			x_flag = true;
			this.x_dir *= -1;
			this.setRandomColor();
		}
		if (this.y + this.h > canvas.height || this.y < 0){
			y_flag = true;
			this.setRandomColor();
			this.y_dir *= -1;
		}

		// Apply movement
		this.x += this.x_dir * this.vel;
		this.y += this.y_dir * this.vel;
		
		// If both flags were set in this frame, we hit a corner!
		if (x_flag && y_flag){
			corner_bounce_count++;	
			console.log(`Corner bounce! Corner bounce count is now: ${corner_bounce_count}`);
			counter.innerHTML = corner_bounce_count;
		}
	}
	
	printPos(){
		console.log(`(${this.x},${this.y})`);
	}
}

// initialize the logo object
// let dvd_logo = new DVDLogo((CANVAS_W/2)-LOGO_W, (CANVAS_H/2)-LOGO_H, LOGO_W, LOGO_H, LOGO_VEL);
let dvd_logo = new DVDLogo(CANVAS_W/2, CANVAS_H/2, LOGO_W, LOGO_H, LOGO_VEL);

// update() is called each frame.
function update() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	dvd_logo.update();
	dvd_logo.renderToCanvas();
	// dvd_logo.printPos();
}

// Set up the game loop
setInterval(update, 10);
