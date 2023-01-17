import Engine from "./engine.js";

const SPEED = 3;
const SCALE = 3;
const DEBUG = false;

const lerp = (start, end, amt) => {
	return (1 - amt) * start + amt * end;
};

class CanvasEngine extends Engine {
	constructor() {
		super();
		this.texture = {
			width: 32,
			height: 32,
		};
		this.canvasUI = document.querySelector("#canvasUI");
		this.canvasUI.width = this.width;
		this.canvasUI.height = this.height;
	}
	init() {
		// Canvas context setup
		this.ctx = this.canvas.getContext("2d");
		this.ctxUI = this.canvasUI.getContext("2d");
		this.ctx.webkitImageSmoothingEnabled = false;
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.strokeStyle = "aqua";
		this.ctxUI.fillStyle = "white";

		this.player = {
			x: 0,
			y: 0,
			width: this.texture.width * SCALE,
			height: this.texture.height * SCALE,
			movement: {
				left: false,
				up: false,
				right: false,
				down: false,
			},
			animations: {
				idle: { from: 0, to: 10, speed: 10 },
				run: { from: 11, to: 22, speed: 4 },
			},
			animation: {
				state: "idle",
				frame: 0,
				timer: 0,
			},
			play: (state) => {
				this.player.animation.state = state;
				this.player.animation.timer = 0;
				this.player.animation.frame = this.player.animations[state].from;
			},
			animate: () => {
				const animations = this.player.animations;
				const animation = this.player.animation;
				const state = this.player.animation.state;

				// Add to frame when timer equals to current speed
				if (animation.timer >= animations[state].speed) {
					animation.timer = 0;
					animation.frame++;
				} else animation.timer += 1; // Else add timer
				// Loop animation
				if (animation.frame >= animations[state].to)
					animation.frame = animations[state].from;
			},
		};
		this.sprite = new Image();
		this.sprite.src = "spritesheet.png";

		this.camera = {
			x: this.height / 2 - this.player.y - this.player.height / 2,
			y: this.height / 2 - this.player.y - this.player.height / 2,
		};

		this.initInputs();
	}
	initInputs() {
		window.addEventListener("keydown", (event) => {
			const { key } = event;
			if (key === "ArrowLeft" || key === "a") {
				this.player.movement.left = true;
				this.player.movement.right = false;
				this.player.facing = 0;
			} else if (key === "ArrowUp" || key === "w") {
				this.player.movement.up = true;
			} else if (key === "ArrowRight" || key === "d") {
				this.player.movement.right = true;
				this.player.movement.left = false;
				this.player.facing = 1;
			} else if (key === "ArrowDown" || key === "s") {
				this.player.movement.down = true;
			}
		});
		window.addEventListener("keyup", (event) => {
			const { key } = event;
			if (key === "ArrowLeft" || key === "a") {
				this.player.movement.left = false;
			} else if (key === "ArrowUp" || key === "w") {
				this.player.movement.up = false;
			} else if (key === "ArrowRight" || key === "d") {
				this.player.movement.right = false;
			} else if (key === "ArrowDown" || key === "s") {
				this.player.movement.down = false;
			}
		});
	}
	render() {
		// Clear the canvas
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.ctxUI.clearRect(0, 0, this.width, this.height);

		// Update camera to follow player
		this.camera.x = lerp(
			this.camera.x,
			this.width / 2 - this.player.x - this.player.width / 2,
			0.03
		);
		this.camera.y = lerp(
			this.camera.y,
			this.height / 2 - this.player.y - this.player.height / 2,
			0.03
		);
		// Update player
		let speed = SPEED;
		const movement = Object.values(this.player.movement).filter(
			(v) => v
		).length;
		if (movement > 1) speed *= 0.71;
		if (this.player.movement.left) this.player.x -= speed;
		if (this.player.movement.up) this.player.y -= speed;
		if (this.player.movement.right) this.player.x += speed;
		if (this.player.movement.down) this.player.y += speed;

		if (this.player.animation.state !== "idle" && movement === 0) {
			this.player.play("idle");
		} else if (this.player.animation.state !== "run" && movement > 0) {
			this.player.play("run");
		}

		// Animate player
		this.player.animate();

		// Draw player
		this.ctx.save();
		this.ctx.translate(this.camera.x, this.camera.y);
		this.ctx.save();
		if (this.sprite.complete) {
			// Should have duplicated the sprite to include flipped view as well. Faster performance that way
			if (this.player.facing === 0) {
				this.ctx.translate(
					this.player.x + this.player.width / 2,
					this.player.y + this.player.width / 2
				);
				this.ctx.scale(-1, 1);
				this.ctx.translate(
					-(this.player.x + this.player.width / 2),
					-(this.player.y + this.player.width / 2)
				);
			}
			this.ctx.beginPath();
			this.ctx.drawImage(
				this.sprite,
				this.player.animation.frame * this.texture.width,
				0,
				this.texture.width,
				this.texture.height,
				this.player.x,
				this.player.y,
				this.player.width,
				this.player.height
			);
			if (DEBUG)
				this.ctx.strokeRect(
					this.player.x,
					this.player.y,
					this.player.width,
					this.player.height
				);
		}
		this.ctx.restore();
		this.ctx.restore();

		// Draw text
		this.ctxUI.font = "48px serif";
		this.ctxUI.fillText(`State: ${this.player.animation.state}`, 15, 50);
		this.ctxUI.fillText(`Frame: ${this.player.animation.frame}`, 15, 50 * 2);
		this.ctxUI.fillText(
			`Pos: ${Math.round(this.player.x)},${Math.round(this.player.y)}`,
			15,
			50 * 3
		);

		this.request = window.requestAnimationFrame(() => this.render());
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const engine = new CanvasEngine();
	engine.init();
	engine.render();
});
