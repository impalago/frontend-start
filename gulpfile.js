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

// Sprite path
const spriteSrc = 'frontend/sprite/*.png';
const spriteDestImg = 'public/images/sprite';
const spriteDestSass = 'frontend/sass/sprite';

// Javascript path
const jsSrc = 'frontend/js/**';
const jsDest = 'public/js';

// Clean 'public' folder
gulp.task('clean', function() {
    return del('public');
});

// Copy files from assets directory
gulp.task('assets', function () {
    return gulp.src(assetsSrc, {since: gulp.lastRun('assets')})
        .pipe($.newer(assetsDest))
        .pipe(gulp.dest(assetsDest));
});

// Sass
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

// Js
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

// Minification images
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

// Create a sprite
gulp.task('sprite', function () {
    var spriteData = gulp.src(spriteSrc).pipe($.spritesmith({
        imgName: 'sprite.png',
        imgPath: '../images/sprite/sprite.png',
        cssName: 'sprite.scss'
    }));
    return spriteData.pipe($.if('*.scss', gulp.dest(spriteDestSass), gulp.dest(spriteDestImg)));
});

// Server
gulp.task('serve', function() {
    browserSync.init({
        server: 'public'
    });
    browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

// Watch
gulp.task('watch', function() {
    gulp.watch(assetsSrc, gulp.series('assets'));
    gulp.watch(sassSrc, gulp.series('sass'));
    gulp.watch(jsSrc, gulp.series('js'));
    gulp.watch(imgSrc, gulp.series('imagemin'));
});

// Build task
gulp.task('build', gulp.series('clean',  gulp.parallel('assets', 'sprite', 'sass', 'js', 'imagemin')));

// Default task
//     To get started work you need to run the command
//         $ gulp.
//     When the project is ready and you are ready to do the final assembly, run the command
//         $ NODE_ENV=production gulp
gulp.task('default',
    $.if(isDevelopment,
        gulp.series('build',gulp.parallel('watch', 'serve')),
        gulp.series('build')
    )
);
