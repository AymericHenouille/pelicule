const { dest } = require('gulp');
const gulpTypescript = require('gulp-typescript');
const minify = require('gulp-minify');

const tsProject = gulpTypescript.createProject('tsconfig.json');

function compile() {
  return tsProject.src()
    .pipe(tsProject()).js
    .pipe(dest('bin'));
}

exports.compile = compile;
exports.default = compile;