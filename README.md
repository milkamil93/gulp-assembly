# Сборка Gulp (pug, stylus+postcss, svgSprite ...)

## В сборку Gulp входят:

* Pug — препроцессор HTML (на основании MIT License).
* Stylus — препроцессор CSS (MIT License).
* Bower — пакетный менеджер внешних библиотек (MIT License).
* Плагины для минификации и оптимизации файлов стилей и скриптов.
* Плагины для обработки изображений.

## Установка
Уже должен быть установлен Node.js и Git

### Gulp
Установка Gulp производится два раза. Первый раз — это установка в систему, т.е. глобальная установка. И второй раз — это установка уже в самом проекте, которая будет выполнена позже.
```
npm install gulp-cli -g
```

### Bower
Bower — это пакетный менеджер внешних библиотек. Например, Normalize.css, jQuery, Bootstrap, Font Awesome и др. С помощью Bower производится управление, установка или удаление программ. Это очень удобно и сокращает время на разработку, т.к. внешние библиотеки собраны в одном месте.
```
npm install -g bower
```

### Пример структуры проекта
```
root/
|------/app/
|----------/assets/
|-----------------/css/
|---------------------/common.min.css
|---------------------/common.css
|---------------------/vendor.min.css
|-----------------/fonts/
|-----------------/images/
|-----------------/js/
|--------------------/common.min.js
|--------------------/common.js
|--------------------/vendor.min.js
|----------/blocks/
|-----------------/block-1/
|-------------------------/block-1.js
|-------------------------/block-1.styl
|-----------------/block-2/
|-------------------------/block-2.js
|-------------------------/block-2.styl
|-----------------/block-3/
|-------------------------/block-3.js
|-------------------------/block-3.styl
|----------/materials/
|----------/pug/
|--------------/blocks/
|---------------------/footer.pug
|---------------------/head.pug
|---------------------/header.pug
|---------------------/sidebar.pug
|--------------/layouts/
|----------------------/default.pug
|--------------/pages/
|--------------------/404.pug
|--------------------/about.pug
|--------------------/contacts.pug
|--------------------/index.pug
|--------------------/services.pug
|----------/config/
|-----------------/mixins.styl
|-----------------/variables.styl
|----------/404.html
|----------/about.html
|----------/contacts.html
|----------/index.html
|----------/services.html
|------/.bowerrc
|------/.gitignore
|------/bower.json
|------/gulpfile.js
|------/package.json
|------/dist/
|-----------/assets/
|------------------/css/
|----------------------/common.min.css
|----------------------/vendor.min.css
|------------------/fonts/
|------------------/images/
|------------------/js/
|---------------------/common.min.js
|---------------------/vendor.min.js
|-----------/404.html
|-----------/about.html
|-----------/contacts.html
|-----------/index.html
|-----------/services.html
|------/node_modules/
|------/bower_components/
```

* app — development-папка, папка для разработки. В ней происходит вся работа.
* dist — production-папка, папка окончательной сборки для production.
* node_modules — папка NPM в проекте.
* blocks — папка блоков.
* .bowerrc — конфигурационный файл Bower.
* .gitignore — файл исключений из системы контроля версий файлов и папок.
* bower.json — файл-манифест Bower.
* gulpfile.js — файл для настройки работы Gulp.
* package.json — файл-манифест NPM.

Файловая структура составлена согласно рекомендациям методологии БЭМ (Блок — Элемент — Модификатор) от Яндекс.

### Инициализация NPM (пакетный менеджер Node.js) в проекте
```
npm init
```
На все вопросы можно нажимать Enter. При необходимости в файле package.json можно будет откорректировать установочную информацию.

В результате инициализации создается файл-манифест NPM package.json.

### Установка Gulp в проект
Вначале производилась глобальная установка Gulp. Теперь необходимо установить Gulp в проект. В сборке используется Gulp 4:
```
npm install -D gulpjs/gulp#4.0
```

### Установка остальных плагинов
В проекте используются различные плагины для работы препроцессоров Pug и Stylus, минификации файлов, обработки изображений, а также вспомогательные плагины. Описание плагинов можно посмотреть в файле gulpfile.js.

```
npm install -D browser-sync gulp-concat del gulp-imagemin gulp-plumber imagemin-pngquant gulp-pug gulp-rename gulp-stylus gulp-sourcemaps gulp-uglify gulp-svg-sprite nib rupture gulp-postcss gulp-cssnano autoprefixer pug browserslist
```

### Инициализация Bower в проекте
```
bower init
```

### Установка библиотек
По умолчанию используем `jQuery, Normalize.css, Bootstrap, Open Sans, FancyBox, OwlCarousel2.`
```
bower install -D jquery svg4everybody normalize.css bootstrap open-sans-fontface fancybox owl-carousel2
```
Посмотреть список установленных программ и плагинов можно через команду:
```
bower list
```
Для изменения списка пакетов необходимо редактировать в файле gulpfile.js `paths.app.vendor`

Список пакетов bower можно посмотреть на сайте https://bower.io/search/