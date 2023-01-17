import kaboom from "kaboom";
import Engine from "./engine.js";

const SPEED = 120;
class KaboomEngine extends Engine {
	constructor() {
		super();
	}
	init() {
		// Start a kaboom game
		const k = kaboom({
			background: [26, 26, 26],
			global: false,
			canvas: this.canvas,
			width: this.width,
			height: this.height,
			font: "sinko",
		});
		this.k = k;

		// Loading a multi-frame sprite is simple to use
		k.loadSprite("player", "spritesheet.png", {
			// The image contains 25 frames layed out horizontally, slice it into individual frames
			sliceX: 25,
			// Define animations
			anims: {
				idle: {
					// Starts from frame 0, ends at frame 10
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
			},
		});
		k.gravity(0);

		// Debug mode is availabe through .debug
		// k.debug.inspect = true;

		// Add our player character
		this.player = k.add([
			k.sprite("player"),
			k.pos(0, 0),
			k.origin("center"),
			k.scale(3),
			k.area(),
		]);
		// .play is provided by sprite() component, it starts playing the specified animation (the animation information of "idle" is defined above in loadSprite)
		this.player.play("idle");
		this.player.onUpdate(() => {
			k.camPos(this.camera);
		});
		this.camera = this.player.pos;

		// Add some text to show the current animation status
		this.label = k.add([
			k.text(this.getSpriteInfo()),
			k.pos(15),
			k.scale(3),
			k.fixed(),
		]);
		this.initInputs();
	}
	getSpriteInfo() {
		return `
State: ${this.player.curAnim()}
Frame: ${this.player.frame}
Pos: ${Math.round(this.player.pos.x)},${Math.round(this.player.pos.y)}`.trim();
	}
	initInputs() {
		const k = this.k;
		const player = this.player;

		// A little bit problem as this is not extensible, seems to be difficult if we ever wanted to checking for currently keydowns
		k.onKeyDown(["left", "a"], () => {
			player.move(-SPEED, 0);
			player.flipX(true);
			// .play() will reset to the first frame of the anim, so we want to make sure it only runs when the current animation is not "run"
			if (player.curAnim() !== "run") player.play("run");
		});
		k.onKeyDown(["right", "d"], () => {
			player.move(SPEED, 0);
			player.flipX(false);
			if (player.curAnim() !== "run") player.play("run");
		});
		k.onKeyDown(["up", "w"], () => {
			player.move(0, -SPEED);
			if (player.curAnim() !== "run") player.play("run");
		});
		k.onKeyDown(["down", "s"], () => {
			player.move(0, SPEED);
			if (player.curAnim() !== "run") player.play("run");
		});
		k.onKeyRelease(["left", "right", "up", "down", "a", "d", "w", "s"], () => {
			player.play("idle");
		});
	}
	render() {
		const k = this.k;
		k.onUpdate(() => {
			this.label.text = this.getSpriteInfo();
			this.camera = k.vec2(
				k.lerp(this.camera.x, this.player.pos.x, 0.03),
				k.lerp(this.camera.y, this.player.pos.y, 0.03)
			);
		});
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const engine = new KaboomEngine();
	engine.init();
	engine.render();
});
