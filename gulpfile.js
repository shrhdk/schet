/*eslint strict:0*/

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');
var del = require('del');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

// Clean

gulp.task('clean', function (done) {
  return del(['build', 'public/lib', 'npm-debug.log', '!*/.gitkeep'], done);
});

gulp.task('clean:all', ['clean'], function (done) {
  return del(['node_modules', 'bower_components'], done);
});

// Build

gulp.task('build:settings', function () {
  return gulp.src('src/**/*.json')
    .pipe(gulp.dest('build/src/'));
});

gulp.task('build:babel', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('build/src/'));
});

gulp.task('build:browser', ['build:babel'], function () {
  browserify('./build/src/browser/index.js')
    .bundle()
    .pipe(source('index.js'))
    .pipe(gulp.dest('build/public'));

  browserify('./build/src/browser/event.js')
    .bundle()
    .pipe(source('event.js'))
    .pipe(gulp.dest('build/public'));
});

gulp.task('build:test', function () {
  return gulp.src('test/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('build/test/'));
});

gulp.task('build', ['build:settings', 'build:babel', 'build:browser', 'build:test']);

// Test

gulp.task('lint', function () {
  return gulp.src(['*.js', 'src/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('test', ['build:test'], function (done) {
  gulp.src('build/test/**/*.js')
    .pipe(mocha({
      reporter: 'spec'
    }))
    .on('end', done);
});

// Debug

gulp.task('debug:db', function (done) {
  var mongo = require('./build/src/models/mongo');
  mongo.init(require('./debug/dummy-db'), done);
});

// Deploy

gulp.task('init', function (done) {
  var mongo = require('./src/models/mongo');
  mongo.init({
    counters: [
      {id: 'events', seq: 0}
    ]
  }, done);
});
