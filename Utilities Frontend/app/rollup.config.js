// Import rollup plugins
import html from "@web/rollup-plugin-html";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import minifyHTML from "rollup-plugin-minify-html-literals";
import summary from "rollup-plugin-summary";

export default [
  // main app
  {
    plugins: [
      // Entry point for application build; can specify a glob to build multiple
      // HTML files for non-SPA app
      html({
        input: "index.html",
      }),
      // Resolve bare module specifiers to relative paths
      resolve(),
      // Minify HTML template literals
      minifyHTML(),
      // Minify JS
      terser({
        ecma: 2020,
        module: true,
        warnings: true,
      }),
      // Print bundle summary
      summary(),
      copy({
        targets: [
          { src: "src/images", dest: "dist/assets" },
          { src: "src/callbacks", dest: "dist" },
        ],
      }),
    ],
    output: {
      dir: "dist",
    },
    preserveEntrySignatures: "strict",
  },
  // openid callbacks
  {
    input: "src/callbacks/openidconnect-signin-silent-callback.js",
    output: {
      file: "dist/callbacks/openidconnect-signin-silent-callback.js",
      format: "cjs",
    },
  },
  {
    input: "src/callbacks/openidconnect-popup-signout-callback.js",
    output: {
      file: "dist/callbacks/openidconnect-popup-signout-callback.js",
      format: "cjs",
    },
  },
  {
    input: "src/callbacks/openidconnect-popup-signin-callback.js",
    output: {
      file: "dist/callbacks/openidconnect-popup-signin-callback.js",
      format: "cjs",
    },
  },
];
