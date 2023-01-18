import fs from "fs";
import { resolve } from "path";

const input = {};
fs.readdirSync("src").forEach((file) => {
	if (file.endsWith(".html")) {
		if (file === "index.html") return;
		input[file.split(".")[0]] = resolve("src", file);
	}
});

export default {
	root: "src",
	base:
		process.env.NODE_ENV === "development"
			? "./"
			: "/js-sprite-animation-test/",
	build: {
		outDir: "../dist",
		minify: false,
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: resolve("src", "index.html"),
				...input,
			},
		},
	},
};
