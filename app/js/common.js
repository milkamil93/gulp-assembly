;(function ($) {

    svg4everybody();
    $('[target="_blank"]').attr('rel','noopener noreferrer');
    $('form').addClass('-visor-no-click');

    $(function() {
        $('[type="tel"]').inputmask('+7 (999) 999-99-99', {
            'onincomplete': function () {
                $(this).val('');
            }
        });
    });
	
})(jQuery);