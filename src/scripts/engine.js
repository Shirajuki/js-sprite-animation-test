class Engine {
	constructor() {
		this.canvas = document.querySelector("#canvas");
		this.width = 1024;
		this.height = 480;
		canvas.width = this.width;
		canvas.height = this.height;
		this.texture = {
			width: 32,
			height: 32,
		};
	}
	init() {}
	render() {}
}

export default Engine;
