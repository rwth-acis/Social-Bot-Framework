const gulp = require("gulp");
const replace = require("gulp-replace");
const del = require("del");
const fs = require("fs");
const merge = require("merge-stream");
const rollup = require("rollup");
const loadConfigFile = require("rollup/dist/loadConfigFile");
const path = require("path");

gulp.task("clean:dist", () => {
  return del(["dist/*.js", "dist/assets"]);
});

gulp.task("copy:modules", () => {
  const copyNodeModules = gulp
    .src("node_modules/**")
    .pipe(gulp.dest("dist/node_modules"));
  const copyBowerModules = gulp
    .src("bower_components/**")
    .pipe(gulp.dest("dist/bower_components"));
  return merge(copyNodeModules, copyBowerModules);
});

gulp.task("replace config variables", () => {
  const config = JSON.parse(fs.readFileSync("./config.json"));
  const packageInfo = JSON.parse(fs.readFileSync("./package.json"));

  const result = gulp
    .src("dist/*.js")
    .pipe(replace("{SYNC_META_HOST}", config.syncMetaHost))
    .pipe(replace("{OIDC_CLIENT_ID}", config.oidc_client_id))
    .pipe(replace("{YJS_ADDRESS}", config.yjs_address))
    .pipe(replace("{YJS_RESOURCE_PATH}", config.yjs_resource_path))
    .pipe(replace("{STATUSBAR_SUBTITLE}", "v" + packageInfo.version))
    .pipe(replace("{CONTACT_SERVICE_URL}", config.contact_service_url))
    .pipe(gulp.dest("dist"));

  return result;
});

gulp.task(
  "clean-build:full",
  gulp.series("clean:dist", "copy:modules", bundle, "replace config variables")
);

gulp.task("build:watch", gulp.series("clean-build:full", watchChanges));

gulp.task(
  "clean-build:src",
  gulp.series("clean:dist", bundle, "replace config variables")
);

/**
 * Bundles the app  and copies it to the dist folder
 */
async function bundle() {
  const { options, warnings } = await loadConfigFile(
    path.resolve(__dirname, "rollup.config.js"),
    {
      format: "es",
    }
  );
  console.log(`${warnings.count} warnings while loading rollup.config.js`);
  warnings.flush();
  for (const optionsObj of options) {
    const bundle = await rollup.rollup(optionsObj);
    await Promise.all(optionsObj.output.map(bundle.write));
  }
}

async function watchChanges() {
  const watcher = gulp.watch(
    "src/**",
    gulp.series("clean:dist", bundle, "replace config variables")
  );
  watcher.on("change", () => {
    console.log("\nRebuilding...\n");
  });
  watcher.on("ready", () => {
    console.log("\nWatching for changes...\n");
  });
}
