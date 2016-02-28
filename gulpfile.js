'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();
const combine = require('stream-combiner2').obj;

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

// Assets path
const assetsSrc = 'frontend/assets/**';
const assetsDest = 'public';
// Sass path
const sassSrc = 'frontend/sass/**/*.scss';
const sassDest = 'public/css';
// Images path
const imgSrc = 'frontend/images/**';
const imgDest = 'public/images';
// Javascript path
const jsSrc = 'frontend/js/**';
const jsDest = 'public/js';

gulp.task('clean', function() {
    return del('public');
});

gulp.task('assets', function () {
    return gulp.src(assetsSrc, {since: gulp.lastRun('assets')})
        .pipe($.newer(assetsDest))
        .pipe(gulp.dest(assetsDest));
});

gulp.task('sass', function () {
    return combine(
        gulp.src(sassSrc),
        $.if(isDevelopment, $.sourcemaps.init()),
        $.sass(),
        $.autoprefixer({
                browsers: ['last 2 versions']
            }),
        $.concat('main.css'),
        $.if(isDevelopment, $.sourcemaps.write()),
        $.if(!isDevelopment, $.cssnano()),
        gulp.dest(sassDest)
    ).on('error', $.notify.onError());
});

gulp.task('js', function() {
    return combine(
        gulp.src(jsSrc),
        $.if(isDevelopment, $.sourcemaps.init()),
        $.concat('main.js'),
        $.if(isDevelopment, $.sourcemaps.write()),
        $.if(!isDevelopment, $.uglify()),
        gulp.dest(jsDest)
    ).on('error', $.notify.onError());
});

gulp.task('imagemin', function() {
    return combine(
        gulp.src(imgSrc),
        $.newer(imgDest),
        $.imagemin({
            progressive: true
        }),
        gulp.dest(imgDest)
    ).on('error', $.notify.onError());
});

gulp.task('serve', function() {
    browserSync.init({
        server: 'public'
    });
    browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

gulp.task('watch', function() {
    gulp.watch(assetsSrc, gulp.series('assets'));
    gulp.watch(sassSrc, gulp.series('sass'));
    gulp.watch(jsSrc, gulp.series('js'));
    gulp.watch(imgSrc, gulp.series('imagemin'));
});

gulp.task('build', gulp.series('clean',  gulp.parallel('assets', 'sass', 'js', 'imagemin')));

gulp.task('default',
    gulp.series('build',
        $.if(isDevelopment,
            gulp.parallel('watch', 'serve')
        )
    )
);