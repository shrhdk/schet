/*eslint strict:0*/

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');

// Common

gulp.task('lint', function () {
  return gulp.src(['*.js', 'src/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('build:settings', function () {
  return gulp.src('src/**/*.json')
    .pipe(gulp.dest('build/src/'));
});

gulp.task('build:test', function () {
  return gulp.src('test/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('build/test/'));
});

gulp.task('build', ['build:settings', 'build:server', 'build:client', 'build:test']);

gulp.task('test', ['build:test'], function (done) {
  gulp.src('build/test/**/*.js')
    .pipe(mocha({
      reporter: 'spec'
    }))
    .on('end', done);
});

gulp.task('init', function (done) {
  var mongo = require('./src/models/mongo');
  mongo.init({
    counters: [
      {id: 'events', seq: 0}
    ]
  }, done);
});

// Server

gulp.task('clean:server', function (done) {
  return del(['build/*'], done);
});

gulp.task('build:server', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('build/src/'));
});

// Client

gulp.task('clean:client', function (done) {
  return del(['public/lib/*'], done);
});

gulp.task('build:client', function () {
  gulp.src('bower_components/jquery/dist/**')
    .pipe(gulp.dest('public/lib/jquery/js'));

  gulp.src('bower_components/bootstrap/dist/**')
    .pipe(gulp.dest('public/lib/bootstrap'));

  gulp.src('bower_components/bootstrap-daterangepicker/daterangepicker.js')
    .pipe(gulp.dest('public/lib/bootstrap-daterangepicker/js'));

  gulp.src('bower_components/bootstrap-daterangepicker/daterangepicker-bs3.css')
    .pipe(gulp.dest('public/lib/bootstrap-daterangepicker/css'));

  gulp.src('bower_components/moment/moment.js')
    .pipe(gulp.dest('public/lib/moment/js'));
});

// Debug

gulp.task('debug:db', function (done) {
  var mongo = require('./build/src/models/mongo');
  mongo.init(require('./debug/dummy-db'), done);
});
