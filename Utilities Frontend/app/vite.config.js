import { defineConfig } from "vite";
import replace from "@rollup/plugin-replace";
import { rollupPluginHTML } from "@web/rollup-plugin-html";
import config from "./config.json";
import packageInfo from "./package.json";
import nodeResolve from "@rollup/plugin-node-resolve";
// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig(({ command, mode, ssrBuild }) => ({
  build: {
    output: {
      dir: "dist",
      sourcemap: true,
    },
    inputs: {
      index: "/index.html",
      src: "src",
    },
    lib: {
      entry: "src/static-app.js",
      formats: ["es"],
    },
    rollupOptions: {
      external:
        command === "serve" ? [/^lit/, "yjs", "y-websocket", "y-quill"] : [], // Don't bundle node_modules in dev mode
      plugins: [
        replace({
          include: ["src/**/*.js"],
          values: {
            "{SBF_MANAGER}": config.sbfManagerHost,
            "{OIDC_CLIENT_ID}": config.oidc_client_id,
            "{YJS_ADDRESS}": config.yjs_address,
            "{YJS_RESOURCE_PATH}": config.yjs_resource_path,
            "{STATUSBAR_SUBTITLE}": "v" + packageInfo.version,
            "{CONTACT_SERVICE_URL}": config.contact_service_url,
            "{RASA_NLU}": config.rasaEndpoint,
          },
          preventAssignment: true,
          delimiters: ["", ""],
        }),
        nodeResolve(),
        rollupPluginHTML({
          input: "index.html",
        }),
      ],
    },
  },
  server: {
    port: 8082,
  },
}));
