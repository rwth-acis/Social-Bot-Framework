const gulp = require('gulp');
const replace = require('gulp-replace');
const del = require('del');
const fs = require('fs');
const merge = require('merge-stream');

gulp.task('clean:src', () => {
    return del('dist/src').then(() => del('dist/index.html'));
});

gulp.task('copy:modules', () => {
    const copyNodeModules = gulp.src('node_modules/**')
        .pipe(gulp.dest('dist/node_modules'));
    const copyBowerModules = gulp.src('bower_components/**')
        .pipe(gulp.dest('dist/bower_components'));
    return merge(copyNodeModules, copyBowerModules);
});

gulp.task('copy:src', () => {
    const config = JSON.parse(fs.readFileSync('./config.json'));
    // choose the package.json file (edit this later)
    const packageInfo = JSON.parse(fs.readFileSync('./package.json'));
    const copySrc = gulp.src('src/**')
        .pipe(replace('{WEBHOST}', config.webhost))
        .pipe(replace('{OIDC_CLIENT_ID}', config.oidc_client_id))
        .pipe(replace('{YJS_ADDRESS}', config.yjs_address))
        .pipe(replace('{YJS_RESOURCE_PATH}', config.yjs_resource_path))
        .pipe(replace('{STATUSBAR_SUBTITLE}', "v" + packageInfo.version))
        .pipe(gulp.dest('dist/src'));
    const copyIndex = gulp.src('index.html')
        .pipe(gulp.dest('dist'));
    return merge(copySrc, copyIndex);
});

gulp.task('clean-build:full', gulp.series(
    'clean:src',
    'copy:modules',
    'copy:src'
));

gulp.task('clean-build:src', gulp.series(
    'clean:src',
    'copy:src'
));

