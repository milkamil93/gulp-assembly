'use strict';
const

// Подключение плагинов через переменные
    gulp = require('gulp'), // Gulp
    path = require('path'),
    concat = require('gulp-concat'), // Объединение файлов
    imagemin = require('gulp-imagemin'), // Оптимизация изображений
    pngquant = require('imagemin-pngquant'),
    plumber = require('gulp-plumber'), // Обработка ошибок
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
    webpackStream = require('webpack-stream'),
    inlineCss = require('gulp-inline-css'),


// Задание путей к используемым файлам и папкам
    cmsTpl = 'public/',

// массив svg которые не нужно форматировать
    svgIgnore = [],

    paths = {
        watch: {
            pug: './app/pug/**/*.pug',
            styl: [
                './app/cssjs/**/**/*.styl',
                '!./app/cssjs/mixins.styl'
            ],
            js: './app/cssjs/**/**/*.js',
            svg: './app/materials/svg/*.svg',
            svg_files: './app/materials/svg-files/*.svg',
            to_root: './app/materials/to-root/*',
            img: './app/materials/images/**/*'
        },
        dist: {
            html: './' + cmsTpl,
            css: './' + cmsTpl + 'css',
            fonts: './' + cmsTpl + 'css/fonts',
            js: './' + cmsTpl + 'js',
            img: './' + cmsTpl + 'images',
            svg: './' + cmsTpl + 'images/svg',
        },
        app: {
            common: {
                html: './app/pug/pages/*.pug',
                styl: [
                    './app/cssjs/**/**/*.styl',
                    '!./app/cssjs/mixins.styl'
                ],
                js: './app/cssjs/app.js',
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
                svg_files: './app/materials/svg-files/*.svg',
                to_root: './app/materials/to-root/*.*'
            },
            vendor: {
                js: [
                    './node_modules/jquery/dist/jquery.min.js',
                    './node_modules/swiper/swiper-bundle.min.js',
                    './node_modules/inputmask/dist/jquery.inputmask.min.js',
                    './node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js',
                ],
                css: [
                    './app/materials/fonts/**/*.css',
                    './node_modules/normalize.css/normalize.css',
                    './node_modules/bootstrap/dist/css/bootstrap.min.css',
                    './node_modules/swiper/swiper-bundle.min.css',
                    './node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css',
                ]
            }
        },
    },

// Подключение Browsersync
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

// Для работы Browsersync, автообновление браузера
function serve() {
    browserSync.init({
        server: {
            baseDir: paths.dist.html,
            index: 'main.html'
        }
    });
    gulp.watch(paths.watch.pug).on('change', function (file) {
        if (~file.indexOf('layouts')) html();
        else html('./'+file.replace(/\\/g,"/"));
    });
    gulp.watch(paths.watch.img).on('all', function (action, file) {
        if (action === 'unlink') return;
        img('./'+file.replace(/\\/g,"/"));
    });
    gulp.watch(paths.watch.styl, gulp.series('cssCommon'));
    gulp.watch(paths.watch.js, gulp.series('jsCommon'));
    gulp.watch(paths.watch.svg, gulp.series('spritesSvg'));
    gulp.watch(paths.watch.svg_files, gulp.series('svgFiles'));
    gulp.watch(paths.watch.to_root, gulp.series('toRoot'));
    gulp.watch(paths.dist.html+'/*.html').on('change', reload);
}

// Для работы Browsersync, автообновление браузера
function serveMail() {
    browserSync.init({
        watch: false,
        server: {
            baseDir: paths.dist.html,
            index: 'main.html'
        }
    });
    gulp.watch(paths.watch.pug).on('change', function (file) {
        if (~file.indexOf('layouts')) htmlEmail();
        else htmlEmail('./'+file.replace(/\\/g,"/"));
    });
    gulp.watch(paths.watch.img).on('all', function (action, file) {
        if (action === 'unlink') return;
        img('./'+file.replace(/\\/g,"/"));
    });
    gulp.watch(paths.watch.styl).on('change', gulp.series(cssCommon, htmlEmail));
    gulp.watch(paths.dist.html+'/*.html').on('change', reload);
}

// Для работы Pug, преобразование Pug в HTML
function html(file) {
    return gulp.src(typeof file === 'string' ? file : paths.app.common.html)
        .pipe(plumber())
        .pipe(pug({pretty: false}))
        .pipe(gulp.dest(paths.dist.html))
        .pipe(browserSync.stream());
}

// Для работы Pug, преобразование Pug в HTML и подтягивания стилей в атрибуты
function htmlEmail(file) {
    return gulp.src(typeof file === 'string' ? file : paths.app.common.html)
        .pipe(plumber())
        .pipe(pug({pretty: true}))
        .pipe(inlineCss({
            removeHtmlSelectors: true,
            url: 'file://' + path.resolve('./public') + '/',
        }))
        .pipe(gulp.dest(paths.dist.html))
        .pipe(browserSync.stream());
}

// Для объединения шрифтов
function fonts() {
    return gulp.src(paths.app.common.fonts)
        .pipe(rename({dirname:''}))
        .pipe(gulp.dest(paths.dist.fonts));
}

// Для преобразования Stylus-файлов в CSS
function cssCommon() {
    return gulp.src(paths.app.common.styl)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(stylus({
            compress: true,
            use:[nib(), rupture()],
            import: path.resolve('./app/cssjs/mixins.styl')
        }))
        .pipe(postcss())
        .pipe(concat('common.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(browserSync.stream());
}

// Для объединения и минификации пользовательских JS-файлов
function jsCommon() {
    return gulp.src(paths.app.common.js)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(webpackStream({
            mode: 'production',
            output: {
                filename: 'common.min.js',
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /\.node_modules$/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env'],
                                plugins: ['@babel/plugin-transform-runtime']
                            }
                        }
                    }
                ]
            },

        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(browserSync.stream());
}

// Для объединения и минификации CSS-файлов внешних библиотек
function cssVendor() {
    return gulp.src(paths.app.vendor.css)
        .pipe(concat('vendor.min.css'))
        .pipe(cssnano({discardUnused: {fontFace: false}}))
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
                var status = true,
                    path = file.path.split('\\'),
                    filename = path[path.length-1];
                svgIgnore.forEach(function (item) {
                    if(!item.indexOf(filename)) {
                        status = false;
                    }
                });
                if (status) {
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
    return gulp.src(paths.app.common.svg_files)
        .pipe(gulp.dest(paths.dist.svg));
}

// Для обработки изображений
function img(image) {
    const images = (typeof(image) === 'string') ? image : paths.app.common.img;
    return gulp.src(images)
        .pipe(imagemin([
            imagemin.mozjpeg({quality: 85, progressive: true}),
            imagemin.optipng({optimizationLevel: 7}),
            pngquant({quality: [0.8, 0.85]})
        ]))
        .pipe(gulp.dest(paths.dist.img));
}

// Перекидываем файлы в корень
function toRoot() {
    return gulp.src(paths.app.common.to_root)
        .pipe(gulp.dest(paths.dist.html));
}

// Таск для разработки
exports.cssCommon = cssCommon;
exports.html = html;
exports.htmlEmail = htmlEmail;
exports.cssVendor = cssVendor;
exports.jsVendor = jsVendor;
exports.jsCommon = jsCommon;
exports.spritesSvg = spritesSvg;
exports.svgFiles = svgFiles;
exports.toRoot = toRoot;
exports.img = img;
exports.serve = serve;
exports.serveMail = serveMail;

gulp.task('default', gulp.series(
    gulp.parallel(html,cssVendor,cssCommon,jsVendor,jsCommon,fonts,spritesSvg,svgFiles,img,toRoot,serve)
));

gulp.task('email', gulp.series(
    cssCommon,
    gulp.parallel(img,htmlEmail,serveMail)
));