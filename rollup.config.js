import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import replace from "rollup-plugin-replace";

const plugins = [
	resolve(),
	commonjs(),
	replace({
		"process.env.NODE_ENV": JSON.stringify("production"),
	}),
];

export default {
	input: "app.js",
	output: {
		file: ".bin/app.js",
		format: "iife",
		name: "app",
		globals: {
			chaturbate: "cb",
			chaturbatejs: "cbjs",
		},
		indent: false,
		banner: "(function (setTimeout, clearTimeout) {",
		footer: "}(cb.setTimeout, cb.cancelTimeout));",
	},
	external: ["chaturbate", "chaturbatejs"],
	plugins,
};
