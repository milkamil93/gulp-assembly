import {
    header
} from './components'
header();

// подгрузка скрипта относительно шаблона
if (typeof pageName !== 'undefined') {
    try {
        require(`./pages/${pageName}`);
    } catch(e) {
        if (e.message.indexOf('Cannot find module') < 0) {
            console.error(e);
        }
    }
}

// аттрибуты для внещних ссылок
$('[target="_blank"]').attr('rel','noopener noreferrer');

// фикс для яндекс метрики
$('form:not(.-visor-no-click)').addClass('-visor-no-click');

// маска для номера
$('[type="tel"]').inputmask({
    'mask': '+7 999 999-99-99',
    'onincomplete': e => {
        e.target.value = '';
    }
});