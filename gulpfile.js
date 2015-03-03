/*eslint strict:0*/

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');
var del = require('del');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');

// Clean

gulp.task('clean', function (done) {
  return del(['build', 'public/lib', 'npm-debug.log', '!*/.gitkeep'], done);
});

gulp.task('clean:all', ['clean'], function (done) {
  return del(['node_modules', 'bower_components'], done);
});

// Build Resources

gulp.task('build:img', function () {
  return gulp.src(['src/img/*'])
    .pipe(gulp.dest('build/src/public/img'));
});

gulp.task('build:sass', function () {
  gulp.src('./src/sass/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./build/src/public/css'));
});

gulp.task('build:res', ['build:img', 'build:sass'], function () {
  return gulp.src(['src/**/*.json', 'src/**/*.jade', 'src/**/*.svg'])
    .pipe(gulp.dest('build/src/'));
});

// Build JS

gulp.task('build:babel', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('build/src/'));
});

gulp.task('build:browserify', ['build:babel'], function () {
  browserify('./build/src/browser/index.js')
    .bundle()
    .pipe(source('index.js'))
    .pipe(gulp.dest('build/src/public/js'));

  browserify('./build/src/browser/event.js')
    .bundle()
    .pipe(source('event.js'))
    .pipe(gulp.dest('build/src/public/js'));
});

gulp.task('build:test', function () {
  return gulp.src('test/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('build/test/'));
});

gulp.task('build', ['build:res', 'build:babel', 'build:browserify', 'build:test']);

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
  var mongo = require('./build/src/models/mongo');
  mongo.init({
    counters: [
      {id: 'events', seq: 0}
    ]
  }, done);
});
