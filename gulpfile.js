const { src, dest, watch, series } = require('gulp');
const gulpTypescript = require('gulp-typescript');
const gulpClean = require('gulp-clean');

const tsProject = gulpTypescript.createProject('tsconfig.json');
const { outDir } = tsProject.options;

function build() {
  return tsProject.src()
    .pipe(tsProject()).js
    .pipe(dest(outDir));
}

function watchSrc() {
  return watch('src/**/*.ts', { ignoreInitial: false }, series(
    clean, 
    build
  ));
}

function clean() {
  return src(outDir, { read: false, allowEmpty: true })
    .pipe(gulpClean({ force: true }));
}

exports.build = build;
exports.watch = watchSrc;
exports.clean = clean;