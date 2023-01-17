import kaboom from "kaboom";
import Engine from "./engine.js";

const SPEED = 120;
const JUMP_FORCE = 240;

class KaboomEngine extends Engine {
	constructor() {
		super();
	}
	init() {
		// Start a kaboom game
		const k = kaboom({
			scale: 4,
			background: [26, 26, 26],
			global: false,
			canvas: this.canvas,

			font: "sinko",
		});
		this.k = k;

		// Loading a multi-frame sprite
		k.loadSprite("player", "spritesheet.png", {
			// The image contains 25 frames layed out horizontally, slice it into individual frames
			sliceX: 25,
			// Define animations
			anims: {
				idle: {
					// Starts from frame 0, ends at frame 3
					from: 0,
					to: 10,
					// Frame per second
					speed: 10,
					loop: true,
				},
				run: {
					from: 11,
					to: 22,
					speed: 20,
					loop: true,
				},
				// This animation only has 1 frame
				jump: {
					from: 23,
					to: 23,
					speed: 2.5,
					loop: false,
				},
				fall: 24,
			},
		});

		k.gravity(640);

		// Add our player character
		this.player = k.add([
			k.sprite("player"),
			k.pos(k.center()),
			k.origin("center"),
			k.area(),
			k.body(),
		]);
		// .play is provided by sprite() component, it starts playing the specified animation (the animation information of "idle" is defined above in loadSprite)
		this.player.play("idle");

		// Add a platform
		this.platform = k.add([
			k.rect(k.width(), 24),
			k.area(),
			k.pos(0, k.height() - 24),
			k.solid(),
			k.color(1, 1, 1),
		]);
		// Add some text to show the current animation
		this.label = k.add([k.text(this.getSpriteInfo()), k.pos(4)]);
		this.initInputs();
	}
	getSpriteInfo() {
		return `State: ${this.player.curAnim()}\nFrame: ${
			this.player.frame
		}`.trim();
	}
	initInputs() {
		const k = this.k;
		const player = this.player;
		// Switch to "idle" or "run" animation when player hits ground
		player.onGround(() => {
			if (!k.isKeyDown("left") && !k.isKeyDown("right")) {
				player.play("idle");
			} else {
				player.play("run");
			}
		});
		// You can also register an event that runs when certain anim ends
		player.onAnimEnd("jump", () => {
			player.play("fall");
		});
		k.onKeyPress(["space", "up"], () => {
			if (player.isGrounded()) {
				player.jump(JUMP_FORCE);
				player.play("jump");
			}
		});
		k.onKeyDown("left", () => {
			if (player.pos.x - player.width / 2 + 3 > 0) {
				player.move(-SPEED, 0);
			}
			player.flipX(true);
			// .play() will reset to the first frame of the anim, so we want to make sure it only runs when the current animation is not "run"
			if (player.isGrounded() && player.curAnim() !== "run") {
				player.play("run");
			}
		});
		k.onKeyDown("right", () => {
			if (player.pos.x + player.width / 2 - 3 < k.width()) {
				player.move(SPEED, 0);
			}
			player.flipX(false);
			if (player.isGrounded() && player.curAnim() !== "run") {
				player.play("run");
			}
		});
		k.onKeyRelease(["left", "right"], () => {
			// Only reset to "idle" if player is not holding any of these keys
			if (
				player.isGrounded() &&
				!k.isKeyDown("left") &&
				!k.isKeyDown("right")
			) {
				player.play("idle");
			}
		});
	}
	render() {
		this.k.onUpdate(() => {
			this.label.text = this.getSpriteInfo();
		});
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const engine = new KaboomEngine();
	engine.init();
	engine.render();
});
