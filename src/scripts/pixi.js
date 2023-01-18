import * as PIXI from "pixi.js";
import Engine from "./engine.js";

const SPEED = 3;
const SCALE = 3;

const lerp = (start, end, amt) => {
	return (1 - amt) * start + amt * end;
};

class PixiEngine extends Engine {
	constructor() {
		super();
	}
	async init() {
		// Canvas context setup
		this.app = new PIXI.Application({
			width: this.width,
			height: this.height,
			backgroundColor: 0x1a1a1a,
			antialias: true,
		});
		// Update canvas with application view
		this.app.view.classList.add("canvas");
		const main = document.querySelector("main");
		main.removeChild(main.lastElementChild);
		main.appendChild(this.app.view);

		// Allow for pixel art rendering
		PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

		// Setup animation frames
		const idle = new Array(11)
			.fill({})
			.map((_, i) => {
				return {
					frame: { x: 32 * i, y: 0, w: 32, h: 32 },
					sourceSize: { w: 32, h: 32 },
					spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 },
				};
			})
			.reduce((obj, value, i) => {
				obj["idle" + i] = value;
				return obj;
			}, {});
		const run = new Array(11)
			.fill({})
			.map((_, i) => {
				return {
					frame: { x: 32 * (i + 11), y: 0, w: 32, h: 32 },
					sourceSize: { w: 32, h: 32 },
					spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 },
				};
			})
			.reduce((obj, value, i) => {
				obj["run" + (i + 11)] = value;
				return obj;
			}, {});

		// Create atlas data holding the information on animation frames
		const atlasData = {
			frames: {
				...idle,
				...run,
			},
			meta: {
				image: "spritesheet.png",
				format: "RGBA8888",
				size: { w: 32 * 24, h: 32 },
				scale: 3,
			},
			animations: {
				idle: [...Object.keys(idle)],
				run: [...Object.keys(run)],
			},
		};
		// Create the SpriteSheet from data and image
		this.spritesheet = new PIXI.Spritesheet(
			PIXI.BaseTexture.from(atlasData.meta.image),
			atlasData
		);
		this.spritesheet.animationSpeed = {
			idle: 0.1666,
			run: 0.1666,
		};
		// Generate all the Textures asynchronously
		this.spritesheet.parse();

		// Create container / camera object
		this.container = new PIXI.Container();
		this.container.x = this.app.screen.width / 2;
		this.container.y = this.app.screen.height / 2;
		this.app.stage.addChild(this.container);

		// Create player object
		this.player = {
			movement: {
				left: false,
				up: false,
				right: false,
				down: false,
			},
		};

		// Setup animated sprite for player
		this.player = new PIXI.AnimatedSprite(this.spritesheet.animations.idle);
		this.player.anchor.set(0.5);
		this.player.x = 0;
		this.player.y = 0;
		this.player.width = this.texture.width * SCALE;
		this.player.height = this.texture.height * SCALE;
		this.player.movement = {
			left: false,
			up: false,
			right: false,
			down: false,
		};
		this.player.state = "idle";
		this.player.animationSpeed = this.spritesheet.animationSpeed.idle;
		this.player.play();
		// Add player to the canvas stage
		this.container.addChild(this.player);

		// Setup text
		const style = new PIXI.TextStyle({
			fontFamily: "Arial",
			fontSize: 36,
			fontWeight: "bold",
			fill: ["#fff"],
			stroke: "#000",
			strokeThickness: 5,
			wordWrap: true,
			wordWrapWidth: 440,
			lineJoin: "round",
		});
		this.text = new PIXI.Text(this.getSpriteInfo(), style);
		this.text.x = 15;
		this.text.y = 15;
		this.app.stage.addChild(this.text);

		// Setup camera to follow player
		this.camera = { x: 0, y: 0 };
		this.camera.x = lerp(
			this.camera.x,
			this.width / 2 - this.player.x - this.player.width / 2,
			1
		);
		this.camera.y = lerp(
			this.camera.y,
			this.height / 2 - this.player.y - this.player.height / 2,
			1
		);

		this.initInputs();
	}
	getSpriteInfo() {
		return `
State: ${this.player.state}
Frame: ${this.player.currentFrame}
Pos: ${Math.round(this.player.x)},${Math.round(this.player.y)}`.trim();
	}
	initInputs() {
		window.addEventListener("keydown", (event) => {
			const { key } = event;
			if (key === "ArrowLeft" || key === "a") {
				this.player.movement.left = true;
				this.player.facing = 0;
				this.player.scale.x = -9;
			} else if (key === "ArrowUp" || key === "w") {
				this.player.movement.up = true;
			} else if (key === "ArrowRight" || key === "d") {
				this.player.movement.right = true;
				this.player.facing = 1;
				this.player.scale.x = 9;
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
		this.app.ticker.add(() => {
			// Clear the canvas

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
			this.container.position.x = this.camera.x + this.player.width / 2;
			this.container.position.y = this.camera.y + this.player.height / 2;

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

			if (this.player.movement.left) {
				this.player.facing = 0;
				this.player.scale.x = -9;
			} else if (this.player.movement.right) {
				this.player.facing = 1;
				this.player.scale.x = 9;
			}

			// Animate player
			if (this.player.state !== "idle" && movement === 0) {
				this.player.state = "idle";
				this.player.textures = this.spritesheet.animations.idle;
				this.player.animationSpeed = this.spritesheet.animationSpeed.idle;
				this.player.play();
			} else if (this.player.state !== "run" && movement > 0) {
				this.player.state = "run";
				this.player.textures = this.spritesheet.animations.run;
				this.player.animationSpeed = this.spritesheet.animationSpeed.run;
				this.player.play();
			}

			// Update text
			this.text.text = this.getSpriteInfo();
		});
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	const engine = new PixiEngine();
	await engine.init();
	engine.render();
});
