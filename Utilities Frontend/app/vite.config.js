import { defineConfig } from "vite";
import replace from "@rollup/plugin-replace";

import config from "./config.json";
import packageInfo from "./package.json";
import nodeResolve from "@rollup/plugin-node-resolve";
// https://vitejs.dev/config/
export default defineConfig({
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
      external: /^lit/,
      plugins: [
        replace({
          "{SBF_MANAGER}": config.sbfManagerHost,
          "{OIDC_CLIENT_ID}": config.oidc_client_id,
          "{YJS_ADDRESS}": config.yjs_address,
          "{YJS_RESOURCE_PATH}": config.yjs_resource_path,
          "{STATUSBAR_SUBTITLE}": "v" + packageInfo.version,
          "{CONTACT_SERVICE_URL}": config.contact_service_url,
        }),
        nodeResolve(),
      ],
    },
  },
  server: {
    port: 8082,
  },
});
