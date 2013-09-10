(function ($){

    var images = [
        'img/IMG_0552.jpg', 'img/IMG_0997.jpg', 'img/IMG_1006.jpg', 'img/IMG_1089.jpg'
        ,'img/IMG_1102.jpg', 'img/IMG_1400.jpg', 'img/IMG_1459.jpg', 'img/IMG_2105.jpg'
        ,'img/IMG_2139.jpg', 'img/IMG_2159.jpg', 'img/IMG_3186.jpg', 'img/IMG_3507.jpg'
        ,'img/IMG_3546.jpg', 'img/IMG_3592.jpg'
    ];

    $(".test").coverFlow({
        data: images,
        reflection: true,
        buttons: true,
        infinite: false
    });

})(jQuery);
