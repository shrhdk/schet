/*eslint strict:0*/

var rimraf = require('gulp-rimraf');
var gulp = require('gulp');
var eslint = require('gulp-eslint');

gulp.task('lint', function () {
    return gulp.src(['*.js', 'lib/**/*.js', 'test/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('clean', function (done) {
    gulp.src([
        'bower_components',
        'public/lib'
    ])
        .pipe(rimraf())
        .on('end', done);
});

gulp.task('build', function () {
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

gulp.task('db-dummy', function (done) {
    var mongo = require('./lib/models/mongo');
    mongo.init({
        counters: [
            {id: 'events', seq: 1}
        ],
        events: [
            {
                id: 1, title: 'Yakiniku!', description: 'Yakiniku Party',
                terms: {
                    counter: 2,
                    1: '2014-01-01',
                    2: '2014-01-02'
                },
                participants: {
                    counter: 2,
                    1: 'shiro',
                    2: 'kenta'
                },
                record: {
                    1: {
                        1: 'absence',
                        2: 'presence'
                    },
                    2: {
                        1: 'uncertain',
                        2: 'absence'
                    }
                },
                comments: {
                    counter: 2,
                    1: {name: 'hideki', body: 'waaaaaai'},
                    2: {name: 'kenta', body: 'taberu'}
                }
            }
        ]
    }, done);
});

gulp.task('init', function (done) {
    var mongo = require('./lib/models/mongo');
    mongo.init({counters: [
        {id: 'events', seq: 0}
    ]}, done);
});
