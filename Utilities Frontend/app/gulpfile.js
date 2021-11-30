const gulp = require("gulp");
const replace = require("gulp-replace");
const del = require("del");
const fs = require("fs");
const merge = require("merge-stream");
const rollup = require("rollup");
const loadConfigFile = require("rollup/dist/loadConfigFile");
const path = require("path");

gulp.task("clean:src", () => {
  return del("dist/src").then(() => del("dist/index.html"));
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

gulp.task("copy:src", () => {
  const config = JSON.parse(fs.readFileSync("./config.json"));
  
  // choose the package.json file (edit this later)
  const packageInfo = JSON.parse(fs.readFileSync("./package.json"));
  const copySrc = gulp
    .src("src/**")
    .pipe(replace("{WEBHOST}", config.webhost))
    .pipe(replace("{OIDC_CLIENT_ID}", config.oidc_client_id))
    .pipe(replace("{YJS_ADDRESS}", config.yjs_address))
    .pipe(replace("{YJS_RESOURCE_PATH}", config.yjs_resource_path))
    .pipe(replace("{STATUSBAR_SUBTITLE}", "v" + packageInfo.version))
    .pipe(replace("{CONTACT_SERVICE_URL}", config.contact_service_url))
    .pipe(gulp.dest("dist/src"));
  const copyIndex = gulp.src("index.html").pipe(gulp.dest("dist"));
  return merge(copySrc, copyIndex);
});

gulp.task(
  "clean-build:full",
  gulp.series("clean:src", "copy:modules", "copy:src", bundle)
);

gulp.task(
  "build:watch",
  gulp.series("clean-build:full", () => {
    //full build then watch changes
    gulp.watch("src/**", gulp.series("copy:src", bundle));
  })
);

gulp.task("clean-build:src", gulp.series("clean:src", "copy:src"));

/**
 * Bundles the app  and copies it to the dist folder
 */
async function bundle() {
  loadConfigFile(path.resolve(__dirname, "rollup.config.js"), {
    format: "es",
  }).then(async ({ options, warnings }) => {
    console.log(`${warnings.count} warnings while loading rollup.config.js`);
    warnings.flush();
    for (const optionsObj of options) {
      const bundle = await rollup.rollup(optionsObj);
      await Promise.all(optionsObj.output.map(bundle.write));
    }
  });
}
