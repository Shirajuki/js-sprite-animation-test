import Engine from "./engine.js";
import * as Phaser from "phaser";

const SPEED = 3;
const SCALE = 3;

class Scene extends Phaser.Scene {
	constructor() {
		super();
	}
	preload() {
		this.load.spritesheet("player", "spritesheet.png", {
			frameWidth: 32,
			frameHeight: 32,
		});
	}
	create() {
		// Animation set
		this.anims.create({
			key: "idle",
			frames: this.anims.generateFrameNumbers("player", {
				frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			}),
			frameRate: 10,
			repeat: -1,
		});
		this.anims.create({
			key: "run",
			frames: this.anims.generateFrameNumbers("player", {
				frames: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
			}),
			frameRate: 20,
			repeat: -1,
		});

		// Create player
		this.player = this.add.sprite(200, 200);
		this.player.setScale(SCALE);
		this.player.play("idle");
		this.player.movement = {
			left: false,
			up: false,
			right: false,
			down: false,
		};
		this.player.animationState = "idle";

		// Setup text
		this.text = this.add.text(15, 15, this.getSpriteInfo(), {
			fontFamily: "Arial",
			fontSize: 32,
			color: "#fff",
		});

		//  Add in a new camera, the same size and position as the main camera
		const UICam = this.cameras.add(0, 0, 800, 600);

		// Setup camera to follow player
		this.cameras.main.startFollow(this.player, true, 0.03, 0.03);
		//  The main camera will not render the UI Text object
		this.cameras.main.ignore(this.text);

		//  The new UI Camera will not render the player
		UICam.ignore(this.player);

		// Keyboard input setup
		this.input.keyboard.on("keydown", (event) => {
			const { key } = event;
			if (key === "ArrowLeft" || key === "a") {
				this.player.movement.left = true;
				this.player.facing = 0;
			} else if (key === "ArrowUp" || key === "w") {
				this.player.movement.up = true;
			} else if (key === "ArrowRight" || key === "d") {
				this.player.movement.right = true;
				this.player.facing = 1;
			} else if (key === "ArrowDown" || key === "s") {
				this.player.movement.down = true;
			}
		});
		this.input.keyboard.on("keyup", (event) => {
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
	getSpriteInfo() {
		return `
State: ${this.player.animationState}
Frame: ${
			this.player.animationState === "idle"
				? this.player.anims.currentFrame.index
				: this.player.anims.currentFrame.index + 10
		}
Pos: ${Math.round(this.player.x)},${Math.round(this.player.y)}`.trim();
	}
	update(_time, _delta) {
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
		if (
			this.player.movement.left &&
			!this.player.flipX &&
			!this.player.movement.right
		) {
			this.player.facing = 0;
			this.player.flipX = true;
		} else if (
			this.player.movement.right &&
			this.player.flipX &&
			!this.player.movement.left
		) {
			this.player.facing = 1;
			this.player.flipX = false;
		}

		// Animate player
		if (this.player.animationState !== "idle" && movement === 0) {
			this.player.animationState = "idle";
			this.player.play("idle");
		} else if (this.player.animationState !== "run" && movement > 0) {
			this.player.animationState = "run";
			this.player.play("run");
		}

		// Update text
		this.text.text = this.getSpriteInfo();
	}
}

class PhaserEngine extends Engine {
	constructor() {
		super();
	}
	init() {
		// Configure phaser with custom scene
		this.config = {
			type: Phaser.WEBGL,
			width: this.width,
			height: this.height,
			canvas,
			physics: {
				default: "arcade",
				arcade: {
					gravity: { y: 0 },
					debug: false,
					fps: 60,
				},
			},
			input: {
				queue: true,
			},
			backgroundColor: "#1a1a1a",
			scene: [Scene],
			render: { pixelArt: true, antialias: true },
		};
	}
	render() {
		this.game = new Phaser.Game(this.config);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const engine = new PhaserEngine();
	engine.init();
	engine.render();
});
