'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const del = require('del');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

// Sass path
const sassSrc = 'frontend/sass/**/*.scss';
const sassDest = 'public/css';
// Images path
const imgSrc = 'frontend/assets/images/**/*.*';
const imgDest = 'public/images';
// Images path
const jsSrc = 'frontend/js/**/*.*';
const jsDest = 'public/js';

gulp.task('clean', function() {
    return del('public');
});

gulp.task('sass', function () {
    return gulp.src(sassSrc)
        .pipe($.if(isDevelopment, $.sourcemaps.init()))
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe($.concat('main.css'))
        .pipe($.if(isDevelopment, $.sourcemaps.write()))
        .pipe($.if(!isDevelopment, $.cssnano()))
        .pipe(gulp.dest(sassDest));
});

gulp.task('js', function() {
    return gulp.src(jsSrc)
        .pipe($.if(isDevelopment, $.sourcemaps.init()))
        .pipe($.concat('main.js'))
        .pipe($.if(isDevelopment, $.sourcemaps.write()))
        .pipe($.if(!isDevelopment, $.uglify()))
        .pipe(gulp.dest(jsDest));
});

gulp.task('imagemin', function() {
    return gulp.src(imgSrc)
        .pipe($.imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(imgDest))
});

gulp.watch(sassSrc, gulp.series('sass'));
gulp.watch(jsSrc, gulp.series('js'));
gulp.watch(imgSrc, gulp.series('imagemin'));

gulp.task('default', gulp.series('clean', gulp.parallel('sass', 'js', 'imagemin')));