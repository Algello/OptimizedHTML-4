var gulp = require('gulp'),
    /*gutil = require('gulp-util'),*/
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    browsersync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleancss = require('gulp-clean-css'),
    gcmq = require('gulp-group-css-media-queries');
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    notify = require("gulp-notify"),
    lost = require('lost');
rsync = require('gulp-rsync');

// Scripts concat & minify

gulp.task('js', function () {
    return gulp.src([
        /*'app/libs/jquery/dist/jquery.min.js',*/
        'app/js/common.js', // Always at the end
    ])
        .pipe(concat('scripts.min.js'))
        // .pipe(uglify()) // Mifify js (opt.)
        .pipe(gulp.dest('app/js'))
        .pipe(browsersync.reload({stream: true}))
});

gulp.task('browser-sync', function () {
    browsersync({
        server: {
            baseDir: 'app'
        },
        notify: false,
        // tunnel: true,
        // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
    })
});

gulp.task('sass', function () {
    var processors = [
        lost
    ];
    return gulp.src('app/sass/**/*.scss')
        .pipe(sass({outputStyle: 'expand'}).on("error", notify.onError()))
        .pipe(postcss(processors))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleancss({level: {1: {specialComments: 0}}})) // Opt., comment out when debugging
        .pipe(gcmq())
        .pipe(gulp.dest('app/css'))
        .pipe(browsersync.reload({stream: true}))
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function () {
    gulp.watch('app/sass/**/*.scss', ['sass']);
    gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
    gulp.watch('app/*.html', browsersync.reload)
});

gulp.task('rsync', function () {
    return gulp.src('app/**')
        .pipe(rsync({
            root: 'app/',
            hostname: 'username@yousite.com',
            destination: 'yousite/public_html/',
            // include: ['*.htaccess'], // Includes files to deploy
            exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
            recursive: true,
            archive: true,
            silent: false,
            compress: true
        }))
});

gulp.task('default', ['watch']);
