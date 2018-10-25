'use strict';

// Подключение плагинов через переменные
const gulp = require('gulp'), // Gulp
    concat = require('gulp-concat'), // Объединение файлов
    imagemin = require('gulp-imagemin'), // Оптимизация изображений
    plumber = require('gulp-plumber'), // Обработка ошибок
    pngquant = require('imagemin-pngquant'), // Оптимизация PNG-изображений
    pug = require('gulp-pug'), // Pug
    rename = require('gulp-rename'), // Переименование файлов
    stylus = require('gulp-stylus'), // Stylus
    sourcemaps = require('gulp-sourcemaps'), // Карта css
    uglify = require('gulp-uglify'), // Минификация JS-файлов
    svgSprite = require('gulp-svg-sprite'), // Склеивание svg в один
    cheerio = require('gulp-cheerio'),
    nib = require('nib'),
    rupture = require('rupture'),
    postcss = require('gulp-postcss'),
    cssnano = require('gulp-cssnano'), // плагин postcss для сжатия
    autoprefixer = require('autoprefixer'); // плагин postcss для сжатия для ДДобавление вендорных префиксов

// Задание путей к используемым файлам и папкам
const cmsTpl = 'assets/templates/',
    // массив svg которые не нужно форматировать
    svgIgnore = ['direction.svg'],

    paths = {
        watch: {
            pug: './app/pug/**/*.pug',
            styl: './app/styljs/common.styl',
            js: [
                './app/styljs/*.js',
                './app/styljs/**/*.js'
            ],
            svg: './app/materials/svg/*.svg',
            svgfiles: './app/materials/svgfiles/*.svg',
            img: [
                './app/materials/images/**/*',
                './app/materials/images/*'
            ]
        },
        dist: {
            html: './dist',
            css: './dist/' +cmsTpl+ '/css',
            fonts: './dist/' +cmsTpl+ '/css/fonts',
            js: './dist/' +cmsTpl+ '/js',
            img: './dist/' +cmsTpl+ '/images',
            svg: './dist/' +cmsTpl+ '/images/svg',
        },
        app: {
            common: {
                html: './app/pug/pages/*.pug',
                styl: './app/styljs/common.styl',
                js: [
                    './app/styljs/*.js',
                    './app/styljs/**/*.js'
                ],
                css: [
                    './app/materials/fonts/**/*.css'
                ],
                fonts: [
                    './app/materials/fonts/**/*.{ttf,woff,woff2,svg,eot}'
                ],
                img: [
                    './app/materials/images/**/*.{jpg,jpeg,png}',
                    './app/materials/images/*.{jpg,jpeg,png}'
                ],
                svg: './app/materials/svg/*.svg',
                svgfiles: './app/materials/svgfiles/*.svg'
            },
            vendor: {
                fonts: [
                    //'./bower_components/open-sans-fontface/fonts/**/*.{ttf,woff,woff2,svg,eot}'
                ],
                css: [
                    //'./bower_components/open-sans-fontface/open-sans.css',

                    './bower_components/normalize.css/normalize.css',
                    './bower_components/bootstrap/dist/css/bootstrap.min.css',
                    './bower_components/fancybox/dist/jquery.fancybox.css',
                    './bower_components/swiper/dist/css/swiper.min.css'
                ],
                js: [
                    './bower_components/jquery/dist/jquery.min.js',
                    './bower_components/svg4everybody/dist/svg4everybody.min.js',
                    './bower_components/bootstrap/dist/js/bootstrap.min.js',
                    './bower_components/fancybox/dist/jquery.fancybox.js',
                    './bower_components/swiper/dist/js/swiper.min.js'
                ]
            }
        }
    };

// Подключение Browsersync
const browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

// Для работы Browsersync, автообновление браузера
function serve() {
    browserSync.init({
        server: paths.dist.html
    });
    gulp.watch(paths.watch.pug).on('change', function ($file) {
        if (~$file.indexOf('layouts')) {
            html();
        } else {
            html('./'+$file.replace(/\\/g,"/"));
        }

    });
    gulp.watch(paths.watch.img).on('all', function ($action,$file) {
        img('./'+$file.replace(/\\/g,"/"));
    });
    gulp.watch(paths.watch.styl, gulp.series('cssCommon'));
    gulp.watch(paths.watch.js, gulp.series('jsCommon'));
    gulp.watch(paths.watch.svg, gulp.series('spritesSvg'));
    gulp.watch(paths.watch.svgfiles, gulp.series('svgFiles'));
    gulp.watch(paths.dist.html+'/*.html').on('change', reload);
}

// Для работы Pug, преобразование Pug в HTML
function html($file) {
    $file = (typeof($file) === 'string') ? $file : paths.app.common.html;
    return gulp.src($file)
        .pipe(plumber())
        .pipe(pug({pretty: true}))
        .pipe(gulp.dest(paths.dist.html))
        .pipe(browserSync.stream());
}

// Для объединения шрифтов
function fonts() {
    const fonts = paths.app.vendor.fonts.concat(paths.app.common.fonts);
    return gulp.src(fonts)
        .pipe(rename({dirname:''}))
        .pipe(gulp.dest(paths.dist.fonts));
}

// Для преобразования Stylus-файлов в CSS
function cssCommon() {
    return gulp.src(paths.app.common.styl)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(stylus({use:[nib(),rupture()]}))
        .pipe(postcss([autoprefixer({browsers:['last 4 version']})]))
        .pipe(cssnano({discardUnused: {fontFace: false}}))
        .pipe(rename({suffix:'.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(browserSync.stream());
}

// Для объединения и минификации пользовательских JS-файлов
function jsCommon() {
    return gulp.src(paths.app.common.js)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('common.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(browserSync.stream());
}

// Для объединения и минификации CSS-файлов внешних библиотек
function cssVendor() {
    return gulp.src(paths.app.common.css.concat(paths.app.vendor.css))
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.min.css'))
        .pipe(cssnano({discardUnused: {fontFace: false}}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.css));
}

// Для объединения и минификации JS-файлов внешних библиотек
function jsVendor() {
    return gulp.src(paths.app.vendor.js)
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist.js));
}

// Для формирования спрайта svg
function spritesSvg() {
    return gulp.src(paths.app.common.svg)
        .pipe(cheerio({
            run: function ($, file) {
                var $status = true,
                    $path = file.path.split('\\'),
                    $filename = $path[$path.length-1];
                svgIgnore.forEach(function (item) {
                    if(!item.indexOf($filename)) {
                        $status = false;
                    }
                });
                if ($status) {
                    $('style').remove();
                    $('[fill]').removeAttr('fill');
                    $('[style]').removeAttr('style');
                    $('[stroke]').removeAttr('stroke');
                    $('[class]').removeAttr('class');
                }
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(svgSprite({
            mode: {
                inline: true,
                symbol: {
                    sprite: '../sprite.svg'
                }
            }
        }))
        .pipe(gulp.dest(paths.dist.svg));
}

// Целые svg
function svgFiles() {
    return gulp.src(paths.app.common.svgfiles)
        .pipe(gulp.dest(paths.dist.svg));
}

// Для обработки изображений
function img($image) {
    const $images = (typeof($image) === 'string') ? $image : paths.app.common.img;
    return gulp.src($images)
        .pipe(imagemin({use: [pngquant()]}))
        .pipe(gulp.dest(paths.dist.img));
}

// Таск для разработки
exports.html = html;
exports.cssCommon = cssCommon;
exports.jsCommon = jsCommon;
exports.cssVendor = cssVendor;
exports.jsVendor = jsVendor;
exports.spritesSvg = spritesSvg;
exports.svgFiles = svgFiles;
exports.img = img;
exports.serve = serve;
gulp.task('default', gulp.series(
    gulp.parallel(html,cssCommon,jsCommon,cssVendor,jsVendor,fonts,spritesSvg,svgFiles,img,serve)
));