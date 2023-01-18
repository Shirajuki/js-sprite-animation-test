import {
	init,
	Sprite,
	Scene,
	Text,
	GameLoop,
	SpriteSheet,
	initKeys,
	keyPressed,
	lerp,
} from "kontra";
import Engine from "./engine.js";

const SPEED = 3;
const SCALE = 3;

class KontraEngine extends Engine {
	constructor() {
		super();
	}
	init() {
		// Canvas context setup
		const { context } = init();
		this.ctx = context;
		this.ctx.webkitImageSmoothingEnabled = false;
		this.ctx.imageSmoothingEnabled = false;

		this.sprite = new Image();
		this.sprite.src = "spritesheet.png";
		this.sprite.onload = () => {
			this.spritesheet = SpriteSheet({
				image: this.sprite,
				frameWidth: this.texture.width,
				frameHeight: this.texture.height,
				animations: {
					// create a named animation: idle and run
					idle: {
						frames: "0..10", // frames 0 through 10
						frameRate: 10,
						loop: true,
					},
					run: {
						frames: "11..22", // frames 11 through 22
						frameRate: 20,
						loop: true,
					},
				},
			});

			this.player = Sprite({
				x: 0,
				y: 0,
				width: this.texture.width * SCALE,
				height: this.texture.height * SCALE,
				anchor: { x: 0.5, y: 0.5 },
				animations: this.spritesheet.animations,
			});
			this.player.movement = {
				left: false,
				up: false,
				right: false,
				down: false,
			};

			this.scene = Scene({
				id: "game",
				objects: [this.player],
			});

			this.text = Text({
				text: this.getSpriteInfo(),
				font: "32px Arial",
				color: "white",
				x: 15,
				y: 15,
			});

			this.camera = { x: this.player.x, y: this.player.y };
			initKeys();
		};
	}
	getSpriteInfo() {
		return `
State: ${this.player.state}
Frame: ${
			this.player.currentAnimation.frames[0] + this.player.currentAnimation._f
		}
Pos: ${Math.round(this.player.x)},${Math.round(this.player.y)}`.trim();
	}
	checkKeys() {
		if (keyPressed("arrowleft") || keyPressed("a")) {
			this.player.movement.left = true;
			this.player.facing = 0;
		}
		if (keyPressed("arrowup") || keyPressed("w")) {
			this.player.movement.up = true;
		}
		if (keyPressed("arrowright") || keyPressed("d")) {
			this.player.movement.right = true;
			this.player.facing = 1;
		}
		if (keyPressed("arrowdown") || keyPressed("s")) {
			this.player.movement.down = true;
		}

		if (!(keyPressed("arrowleft") || keyPressed("a"))) {
			this.player.movement.left = false;
		}
		if (!(keyPressed("arrowup") || keyPressed("w"))) {
			this.player.movement.up = false;
		}
		if (!(keyPressed("arrowright") || keyPressed("d"))) {
			this.player.movement.right = false;
		}
		if (!(keyPressed("arrowdown") || keyPressed("s"))) {
			this.player.movement.down = false;
		}
	}
	render() {
		this.loop = GameLoop({
			update: () => {
				if (!this.scene) return;

				// Check user input
				this.checkKeys();

				// Update camera to follow player
				this.camera.x = lerp(this.camera.x, this.player.x, 0.03);
				this.camera.y = lerp(this.camera.y, this.player.y, 0.03);
				this.scene.lookAt(this.camera);

				// Update player
				this.player.update();

				let speed = SPEED;
				const movement = Object.values(this.player.movement).filter(
					(v) => v
				).length;
				if (movement > 1) speed *= 0.71;
				if (this.player.movement.left) this.player.x -= speed;
				if (this.player.movement.up) this.player.y -= speed;
				if (this.player.movement.right) this.player.x += speed;
				if (this.player.movement.down) this.player.y += speed;

				if (this.player.movement.left) {
					this.player.facing = 0;
					this.player.scaleX = -1;
				} else if (this.player.movement.right) {
					this.player.facing = 1;
					this.player.scaleX = 1;
				}

				// Animate player
				if (this.player.state !== "idle" && movement === 0) {
					this.player.state = "idle";
					this.player.playAnimation("idle");
				} else if (this.player.state !== "run" && movement > 0) {
					this.player.state = "run";
					this.player.playAnimation("run");
				}
			},
			render: () => {
				if (this.scene) {
					this.scene.render();
					this.text.render();
					this.text.text = this.getSpriteInfo();
				}
			},
		});
		this.loop.start();
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const engine = new KontraEngine();
	engine.init();
	engine.render();
});
