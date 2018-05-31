'use strict';

// Подключение плагинов через переменные
var gulp = require('gulp'), // Gulp
    concat = require('gulp-concat'), // Объединение файлов
    del = require('del'), // Удаление папок и файлов
    imagemin = require('gulp-imagemin'), // Оптимизация изображений
    plumber = require('gulp-plumber'), // Обработка ошибок
    pngquant = require('imagemin-pngquant'), // Оптимизация PNG-изображений
    pug = require('gulp-pug'), // Pug
    rename = require('gulp-rename'), // Переименование файлов
    stylus = require('gulp-stylus'), // Stylus
    sourcemaps = require('gulp-sourcemaps'), // Карта css
    uglify = require('gulp-uglify'), // Минификация JS-файлов
    svgSprite = require('gulp-svg-sprite'), // Склеивание svg в один
    nib = require('nib'),
    rupture = require('rupture'),
    postcss = require('gulp-postcss'),
    cssnano = require('gulp-cssnano'), // плагин postcss для сжатия
    autoprefixer = require('autoprefixer'); // плагин postcss для сжатия для ДДобавление вендорных префиксов

// Задание путей к используемым файлам и папкам
var paths = {
    dir: {
        app: './app',
        dist: './dist'
    },
    watch: {
        pug: './app/pug/**/*.pug',
        styl: './app/styljs/style.styl',
        js: './app/styljs/script.js',
        svg: './app/materials/svg/*.svg'
    },
    app: {
        html: {
            src: './app/pug/pages/*.pug',
            dest: './app'
        },
        common: {
            css: {
                src: './app/styljs/style.styl',
                dest: './app/assets/css'
            },
            js: {
                src: './app/styljs/script.js',
                dest: './app/assets/js'
            }
        },
        vendor: {
            fonts: {
                src: [
                    './bower_components/open-sans-fontface/fonts/**/*{ttf,woff,woff2,svg,eot}',
                    './bower_components/open-sans-fontface/fonts/*{ttf,woff,woff2,svg,eot}'
                ],
                dest: './app/assets/css/fonts'
            },
            css: {
                src: [
                    './bower_components/open-sans-fontface/open-sans.css',
                    './bower_components/normalize.css/normalize.css',
                    './bower_components/bootstrap/dist/css/bootstrap.min.css',
                    './bower_components/fancybox/dist/jquery.fancybox.css',
                    './bower_components/owl.carousel/dist/assets/owl.carousel.css'
                ],
                dest: './app/assets/css'
            },
            js: {
                src: [
                    './bower_components/jquery/dist/jquery.min.js',
                    './bower_components/svg4everybody/dist/svg4everybody.min.js',
                    './bower_components/bootstrap/dist/js/bootstrap.min.js',
                    './bower_components/fancybox/dist/jquery.fancybox.js',
                    './bower_components/owl.carousel/dist/owl.carousel.min.js'
                ],
                dest: './app/assets/js'
            }
        }
    },
    img: {
        src: [
            './app/assets/images/**/*.*',
            './app/assets/images/*.*'
        ],
        dest: './dist/assets/images'
    },
    dist: {
        html: {
            src: './app/*.html',
            dest: './dist'
        },
        fonts: {
            src: './app/assets/fonts/*.*',
            dest: './dist/assets/fonts'
        },
        css: {
            src: './app/assets/css/*.min.css',
            map: './app/assets/css/',
            dest: './dist/assets/css'
        },
        js: {
            src: './app/assets/js/*.min.js',
            dest: './dist/assets/js'
        }
    },
    svg: {
        src: './app/materials/svg/*.svg',
        dest: './app/assets/images'
    },
    fonts: {
        src: [
            './app/materials/fonts/**/*{ttf,woff,woff2,svg,eot}',
            './app/materials/fonts/*{ttf,woff,woff2,svg,eot}'
        ],
        css: [
            './app/materials/fonts/**/*.css',
            './app/materials/fonts/*.css'
        ]
    }
};

// Подключение Browsersync
var browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

// Для работы Browsersync, автообновление браузера
function serve() {
    browserSync.init({
        server: './app'
    });
    gulp.watch(paths.watch.pug).on('change', function ($file) {
        if (~$file.indexOf('layouts')) {
            html();
        } else {
            html('./'+$file.replace(/\\/g,"/"));
        }

    });
    gulp.watch(paths.watch.styl, gulp.series('cssCommon'));
    gulp.watch(paths.watch.js, gulp.series('jsCommon'));
    gulp.watch(paths.watch.svg, gulp.series('spritesSvg'));
    gulp.watch('*.html').on('change', reload);
}

// Для работы Pug, преобразование Pug в HTML
function html($file) {
    $file = (typeof($file) === 'string') ? $file : paths.app.html.src;
    return gulp.src($file)
        .pipe(plumber())
        .pipe(pug({pretty: true}))
        .pipe(gulp.dest(paths.app.html.dest))
        .pipe(browserSync.stream());
}

// Для объединения шрифтов
function fonts() {
    var fonts = paths.app.vendor.fonts.src.concat(paths.fonts.src);
    return gulp.src(fonts)
        .pipe(gulp.dest(paths.app.vendor.fonts.dest));
}

// Для преобразования Stylus-файлов в CSS
function cssCommon() {
    return gulp.src(paths.app.common.css.src)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(concat('common.styl'))
        .pipe(stylus({use:[nib(),rupture()]}))
        .pipe(postcss([autoprefixer({browsers:['last 4 version']})]))
        .pipe(cssnano())
        .pipe(rename({suffix:'.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.app.common.css.dest))
        .pipe(browserSync.stream());
}

// Для объединения и минификации пользовательских JS-файлов
function jsCommon() {
    return gulp.src(paths.app.common.js.src)
        .pipe(plumber())
        .pipe(concat('common.js'))
        .pipe(gulp.dest(paths.app.common.js.dest))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(paths.app.common.js.dest))
        .pipe(browserSync.stream());
}

// Для объединения и минификации CSS-файлов внешних библиотек
function cssVendor() {
    var css = paths.fonts.css.concat(paths.app.vendor.css.src);
    return gulp.src(css)
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.min.css'))
        .pipe(cssnano({discardUnused: {fontFace: false}}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.app.vendor.css.dest));
}

// Для объединения и минификации JS-файлов внешних библиотек
function jsVendor() {
    return gulp.src(paths.app.vendor.js.src)
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.app.vendor.js.dest));
}

// Для формирования спрайта svg
function spritesSvg() {
    return gulp.src(paths.svg.src)
        .pipe(svgSprite({
            mode: {
                //inline: true,
                symbol: {
                    sprite: '../sprite.svg'
                }
            }
        }))
        .pipe(gulp.dest(paths.svg.dest));
}

// Для предварительной очистки (удаления) production-папки
function clean() {
    return del(paths.dir.dist);
}

// Для обработки изображений
function img() {
    return gulp.src(paths.img.src)
        .pipe(imagemin({use: [pngquant()]}))
        .pipe(gulp.dest(paths.img.dest));
}

// Для формирования production-папки
function dist() {
    var htmlDist = gulp.src(paths.dist.html.src)
        .pipe(gulp.dest(paths.dist.html.dest));
    var cssDist = gulp.src(paths.dist.css.src)
        .pipe(gulp.dest(paths.dist.css.dest));
    var jsDist = gulp.src(paths.dist.js.src)
        .pipe(gulp.dest(paths.dist.js.dest));
    var fontsDist = gulp.src(paths.dist.fonts.src)
        .pipe(gulp.dest(paths.dist.fonts.dest));
    return htmlDist, cssDist, jsDist, fontsDist;
}

// Таск для разработки
exports.html = html;
exports.cssCommon = cssCommon;
exports.jsCommon = jsCommon;
exports.cssVendor = cssVendor;
exports.jsVendor = jsVendor;
exports.spritesSvg = spritesSvg;
exports.serve = serve;
gulp.task('default', gulp.series(
    gulp.parallel(html,cssCommon,jsCommon,cssVendor,jsVendor,fonts,spritesSvg,serve)
));

// Таск для production
exports.clean = clean;
exports.img = img;
exports.dist = dist;
gulp.task('public', gulp.series(
    gulp.parallel(clean,img,dist)
));