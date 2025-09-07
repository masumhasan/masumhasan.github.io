//   all ------------------
function initSolonick() {
    "use strict";
    //   loader ------------------
    $(".pin").text("Loading");
    $(".loader-wrap").fadeOut(300, function () {
        $("#main").animate({
            opacity: "1"
        }, 300);
    });
    //   Background image ------------------
    var a = $(".bg");
    a.each(function (a) {
        if ($(this).attr("data-bg")) $(this).css("background-image", "url(" + $(this).data("bg") + ")");
    });
    //   clone ------------------
    $.fn.duplicate = function (a, b) {
        var c = [];
        for (var d = 0; d < a; d++) $.merge(c, this.clone(b).get());
        return this.pushStack(c);
    };
    $("<div class='container full-height'></div>").appendTo(".sec-lines");
    $("<div class='line-item'></div>").duplicate(5).appendTo(".sec-lines .container");

    $("<div class='half-bg-dec-item'></div>").duplicate(12).appendTo(".half-bg-dec");
    $("<div class='hidden-works-item-dec'><i class='fal fa-arrow-left'></i></div>").appendTo(".hidden-works-item");
    var cr2 = $(".card-popup-rainingvis");
    cr2.each(function (cr) {
        var starcount2 = $(this).attr("data-starrating2");
        $("<i class='fas fa-star'></i>").duplicate(starcount2).prependTo(this);
    });
    //   hero parallax hover ------------------
    var $one = $(".mm-parallax"),
        browserPrefix = "",
        usrAg = navigator.userAgent;
    if (usrAg.indexOf("Chrome") > -1 || usrAg.indexOf("Safari") > -1) browserPrefix = "-webkit-";
    else if (usrAg.indexOf("Opera") > -1) browserPrefix = "-o";
    else if (usrAg.indexOf("Firefox") > -1) browserPrefix = "-moz-";
    else if (usrAg.indexOf("MSIE") > -1) browserPrefix = "-ms-";
    $(".hero-wrap").mousemove(function (a) {
        var b = Math.ceil(window.innerWidth / 1.5),
            c = Math.ceil(window.innerHeight / 1.5),
            d = a.pageX - b,
            e = a.pageY - c,
            f = e / c,
            g = -(d / b),
            h = Math.sqrt(Math.pow(f, 2) + Math.pow(g, 2)),
            i = 10 * h;
        $one.css(browserPrefix + "transform", "rotate3d(" + f + ", " + g + ", 0, " + i + "deg)");
    });
    function heroAnim() {
        function a(a) {
            var b = a.length,
                c, d;
            while (b) {
                d = Math.floor(Math.random() * b--);
                c = a[b];
                a[b] = a[d];
                a[d] = c;
            }
            return a;
        }
        var b = $(".half-bg-dec-item");
        $(a(b).slice(0, $(".half-bg-dec").data("ran"))).each(function (a) {
            var bc = $(this);
            b.removeClass("half-bg-dec-vis")
            bc.addClass("half-bg-dec-vis");

        });
    }
    setInterval(function () {
        heroAnim();
    }, 2000);
    //   parallax thumbnails position  ------------------
    $(".bg-parallax-module").each(function () {
        var tcp = $(this),
            dpl = tcp.data("position-left"),
            dpt = tcp.data("position-top");
        tcp.css({
            "top": dpt + "%"
        });
        tcp.css({
            "left": dpl + "%",
        });
    });
    $(".album-thumbnails div").each(function () {
        var dp2 = $(this).data("position-left2"),
            dpt2 = $(this).data("position-top2");
        $(this).css({
            "top": dpt2 + "%"
        });

        $(this).css({
            "left": dp2 + "%",
        });
    });
    $(".section-subtitle").fitText(0.85);
    //   scrollToFixed  ------------------
    $(".scroll-nav-wrap").scrollToFixed({
        minWidth: 569,
        zIndex: 12,
        preUnfixed: function () {
            $(this).css("margin-top", "0");
        },
        preFixed: function () {
            if ($(window).width() < 1064) $(this).css("margin-top", "80px");
        }
    });
    $(".hidden-info-wrap-bg").scrollToFixed({
        minWidth: 1064,
        zIndex: 12,
        marginTop: 80,
        removeOffsets: true,
        limit: function () {
            var a = $(".limit-box").offset().top - $(".hidden-info-wrap-bg").outerHeight(true);
            return a;
        }
    });
    $(".fixed-column").scrollToFixed({
        minWidth: 1064,
        zIndex: 12,
        marginTop: 120,
        removeOffsets: true,
        limit: function () {
            var a = $(".limit-box").offset().top - $(".fixed-column").outerHeight(true) - 50;
            return a;
        }
    });
    if ($(".fixed-bar").outerHeight(true) < $(".post-container").outerHeight(true)) {
        $(".fixed-bar").addClass("fixbar-action");
        $(".fixbar-action").scrollToFixed({
            minWidth: 1064,
            marginTop: function () {
                var a = $(window).height() - $(".fixed-bar").outerHeight(true) - 100;
                if (a >= 0) return 20;
                return a;
            },
            removeOffsets: true,
            limit: function () {
                var a = $(".limit-box").offset().top - $(".fixed-bar").outerHeight() - 20;
                return a;
            }
        });
    } else $(".fixed-bar").removeClass("fixbar-action");
    //   slick  ------------------
    var sbp = $(".sp-cont-prev"),
        sbn = $(".sp-cont-next"),
        ccsi = $(".cur_carousel-slider-container"),
        scw = $(".slider-carousel-wrap"),
        fetcarCounter = $(".fet_pr-carousel-counter"),
        fpr = $('.fet_pr-carousel'),
        scs = $('.show-case-slider'),
        fcshinit = $('.fullscreen-slider'),
        ssn = $('.slider-nav'),
        ssnc = $('.slider-nav-counter'),
        fssc = $('.fullscreenslider-counter'),
        fshc = $('.fs-carousel');
    scs.on("init", function (event, slick) {
        fetcarCounter.text(Number(slick.currentSlide + 1) + ' / ' + slick.slideCount);

    });
    scs.slick({
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        centerMode: true,
        arrows: false,
        variableWidth: true,
    });
    scs.on("afterChange", function (event, slick, currentSlide) {
        var scsc = $(".show-case-item.slick-active").data("curtext");
        var $captproject = $(".single-project-title .caption");
        $captproject.text(scsc).shuffleLetters({});
        fetcarCounter.text(Number(slick.currentSlide + 1) + ' / ' + slick.slideCount);
    });
    $('.single-slider').slick({
        infinite: true,
        slidesToShow: 1,
        dots: true,
        arrows: false,
        adaptiveHeight: true
    });
    fcshinit.on("init", function (event, slick) {
        fssc.text(Number(slick.currentSlide + 1) + ' / ' + slick.slideCount);
    });
    fcshinit.slick({
        infinite: true,
        slidesToShow: 1,
        dots: true,
        arrows: false,
        adaptiveHeight: false
    });
    fcshinit.on("afterChange", function (event, slick, currentSlide) {
        fssc.text(Number(slick.currentSlide + 1) + ' / ' + slick.slideCount);
    });
    $('.slideshow-container').slick({
        slidesToShow: 1,
        autoplay: true,
        autoplaySpeed: 4000,
		pauseOnHover: false,
        arrows: false,
        fade: true,
        cssEase: 'ease-in',
        infinite: true,
        speed: 1000
    });
    fshc.on("init", function (event, slick) {
        ssnc.text(Number(slick.currentSlide + 1) + ' / ' + slick.slideCount);
    });
    fshc.slick({
        infinite: true,
        slidesToShow: 3,
        dots: true,
        arrows: false,
        centerMode: false,
        responsive: [{
                breakpoint: 1224,
                settings: {
                    slidesToShow: 2,
                    centerMode: false,
                }
            },

            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                }
            }
        ]

    });
    fshc.on("afterChange", function (event, slick, currentSlide) {
        ssnc.text(Number(slick.currentSlide + 1) + ' / ' + slick.slideCount);
    });
    $(".fs-carousel-title h3 , .fs-carousel-link").on({
        mouseenter: function () {
            $(this).parents(".fs-carousel-item").find(".bg").addClass("hov-rot");
        },
        mouseleave: function () {
            $(this).parents(".fs-carousel-item").find(".bg").removeClass("hov-rot");
        }
    });
    $('.serv-carousel').slick({
        infinite: true,
        slidesToShow: 3,
        dots: true,
        arrows: false,
        centerMode: false,
        responsive: [{
                breakpoint: 1224,
                settings: {
                    slidesToShow: 2,
                    centerMode: false,
                }
            },

            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                }
            }
        ]

    });
    $('.half-slider-img').slick({
        arrows: false,
        infinite: true,
        fade: false,
        speed: 1000,
        vertical: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '.slider-nav'
    });
    ssn.on("init", function (event, slick) {
        ssnc.text(Number(slick.currentSlide + 1) + ' / ' + slick.slideCount);
    });
    $('.slider-nav').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '.half-slider-img',
        dots: true,
        arrows: false,
        centerMode: false,
        focusOnSelect: false,
        fade: true,
    });
    ssn.on("afterChange", function (event, slick, currentSlide) {
        ssnc.text(Number(slick.currentSlide + 1) + ' / ' + slick.slideCount);
    });
    $('.text-carousel').slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: true,
        arrows: false,
        centerPadding: "0",
        centerMode: true,
        responsive: [{
                breakpoint: 1224,
                settings: {
                    slidesToShow: 2,
                }
            },

            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                }
            }
        ]

    });
    fpr.on("init", function (event, slick) {
        fetcarCounter.text(Number(slick.currentSlide + 1) + ' / ' + slick.slideCount);
    });
    fpr.slick({
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        dots: true,
        arrows: false,
        slickCurrentSlide: 2,
        centerPadding: "0",
        centerMode: true,
        responsive: [{
                breakpoint: 1224,
                settings: {
                    slidesToShow: 4,
                    centerMode: false,
                }
            },

            {
                breakpoint: 1084,
                settings: {
                    slidesToShow: 2,
                    centerMode: true,
                }
            },

            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                }
            }
        ]

    });
    fpr.on("afterChange", function (event, slick, currentSlide) {
        fetcarCounter.text(Number(slick.currentSlide + 1) + ' / ' + slick.slideCount);
    });
    sbp.on("click", function () {
        $(this).closest(scw).find(ccsi).slick('slickPrev');
    });
    sbn.on("click", function () {
        $(this).closest(scw).find(ccsi).slick('slickNext');
    });
    //   Isotope------------------
    function n() {
        if ($(".gallery-items").length) {
            var $grid = $(".gallery-items").isotope({
                singleMode: true,
                columnWidth: ".grid-sizer, .grid-sizer-second, .grid-sizer-three",
                itemSelector: ".gallery-item, .gallery-item-second, .gallery-item-three"
            });
            $grid.imagesLoaded(function () {
                $grid.isotope("layout");
            });
            $(".gallery-filters").on("click", "a.gallery-filter", function (b) {
                b.preventDefault();
                var c = $(this).attr("data-filter"),
                    d = $(this).text();
                $grid.isotope({
                    filter: c
                });
                $(".gallery-filters a").removeClass("gallery-filter-active");
                $(this).addClass("gallery-filter-active");
            });
            var gat = $(".gallery-filter-active").text();
        }

        $(".gallery-items").isotope("on", "layoutComplete", function (a, b) {
            var b = a.length;
            $(".num-album").html(b);
        });
        var b = $(".gallery-item").length;
        $(".all-album , .num-album").html(b);
    }
    n();
    function hoverdirInit() {
        $(".hde  .portfolio_item , .hde .gallery-item").each(function () {
            $(this).hoverdir();
        });
    }
    hoverdirInit();
    $(".team-box").matchHeight();
    // folio hover------------------
    var hidworit = $('.hidden-works-item'),
        hidworit_length = hidworit.length;
    $("<div class='bg'></div>").duplicate(hidworit_length).appendTo(".bg-ser");
    var hidworit_actin = $('.hidden-works-item:first-child'),
        actbgindex = hidworit_actin.data("bgscr");
    hidworit_actin.addClass("act-index");
    $('.bg-ser .bg:first-child').addClass('active').css("background-image", "url(" + actbgindex + ")");
    $('.hidden-works-item').on('mouseover', function () {
        $('.hidden-works-item').removeClass("act-index");
        $(this).addClass("act-index");
        var hidworit_index = $('.hidden-works-item').index(this),
            hidworit_index_each = $(this).data("bgscr");
        $('.bg-ser .bg').removeClass('active').eq(hidworit_index).addClass('active').css("background-image", "url(" + hidworit_index_each + ")");
    });
    //   lightGallery------------------
    function lightGalleryInit() {
        $(".image-popup").lightGallery({
            selector: "this",
            cssEasing: "cubic-bezier(0.25, 0, 0.25, 1)",
            download: false,
            counter: false
        });
        var o = $(".lightgallery"),
            p = o.data("looped");
        o.lightGallery({
            selector: ".lightgallery a.popup-image",
            cssEasing: "cubic-bezier(0.25, 0, 0.25, 1)",
            download: false,
            loop: false,
            counter: false
        });
    }
    lightGalleryInit();
    //   appear------------------
    $(".stats").appear(function () {
        $(".num").countTo();
    });
    $(".piechart-holder").appear(function () {
        $(this).find(".chart").each(function () {
            var cbc = $(".piechart-holder").attr("data-skcolor");
            $(".chart").easyPieChart({
                barColor: cbc,
                trackColor: "#eee",
                scaleColor: "#eee",
                size: "150",
                lineWidth: "40",
                lineCap: "butt",
                animate: 3500,
                easing: "easeInBounce",
                onStep: function (a, b, c) {
                    $(this.el).find(".percent").text(Math.round(c));
                }
            });
        });
    });
    $(".skillbar-box").appear(function () {
        $(this).find("div.skillbar-bg").each(function () {
            $(this).find(".custom-skillbar").delay(600).animate({
                width: $(this).attr("data-percent")
            }, 1500);
        });
    });
    //footer animation ------------------
    var n = $(".partcile-dec").data("parcount");
    $(".partcile-dec").jParticle({
        background: "rgba(255,255,255,0.0)",
        color: "rgba(255,255,255,0.081)",
        particlesNumber: n,
        particle: {
            speed: 20
        }
    });
    //   accordion ------------------
    $(".accordion a.toggle").on("click", function (a) {
        a.preventDefault();
        $(".accordion a.toggle").removeClass("act-accordion");
        $(this).addClass("act-accordion");
        if ($(this).next('div.accordion-inner').is(':visible')) {
            $(this).next('div.accordion-inner').slideUp();
        } else {
            $(".accordion a.toggle").next('div.accordion-inner').slideUp();
            $(this).next('div.accordion-inner').slideToggle();
        }
    });
    $('.cs-wrap .hero-wrap , .nav-holder').perfectScrollbar({});
    // twitter ------------------
    if ($("#twitts-container").length > 0) {
        var config1 = {
            "profile": {
                "screenName": 'masumhasans'
            },
            "domId": 'twitts-container',
            "maxTweets": 2,
            "enableLinks": true,
            "showImages": false
        };
        twitterFetcher.fetch(config1);
    }
    //   Contact form------------------
    $("#contactform").submit(function () {
        var a = $(this).attr("action");
        $("#message").slideUp(750, function () {
            $("#message").hide();
            $("#submit").attr("disabled", "disabled");
            $.post(a, {
                name: $("#name").val(),
                email: $("#email").val(),
                phone: $("#phone").val(),
                subject: $('#subject').val(),
                comments: $("#comments").val(),
                verify: $('#verify').val()

            }, function (a) {
                document.getElementById("message").innerHTML = a;
                $("#message").slideDown("slow");
                $("#submit").removeAttr("disabled");
                if (null != a.match("success")) $("#contactform").slideDown("slow");
            });
        });
        return false;
    });
    $("#contactform input, #contactform textarea").keyup(function () {
        $("#message").slideUp(1500);
    });
    $('.chosen-select').selectbox();
    //   mailchimp------------------
    $("#subscribe").ajaxChimp({
        language: "eng",
        url: "http://kwst.us18.list-manage.com/subscribe/post?u=42df802713d4826a4b137cd9e&id=815d11e811"
    });
    $.ajaxChimp.translations.eng = {
        submit: "Submitting...",
        0: '<i class="fa fa-check"></i> We will be in touch soon!',
        1: '<i class="fa fa-warning"></i> You must enter a valid e-mail address.',
        2: '<i class="fa fa-warning"></i> E-mail address is not valid.',
        3: '<i class="fa fa-warning"></i> E-mail address is not valid.',
        4: '<i class="fa fa-warning"></i> E-mail address is not valid.',
        5: '<i class="fa fa-warning"></i> E-mail address is not valid.'
    };
    function videoint() {
        //   Video------------------
        var v = $(".background-youtube-wrapper").data("vid");
        var f = $(".background-youtube-wrapper").data("mv");
        $(".background-youtube-wrapper").YTPlayer({
            fitToBackground: true,
            videoId: v,
            pauseOnScroll: true,
            mute: f,
            callback: function () {
                var a = $(".background-youtube-wrapper").data("ytPlayer").player;
            }
        });
        var w = $(".background-vimeo").data("vim"),
            bvc = $(".background-vimeo"),
            bvmc = $(".media-container"),
            bvfc = $(".background-vimeo iframe "),
            vch = $(".video-container");
        bvc.append('<iframe src="//player.vimeo.com/video/' + w + '?background=1"  frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen ></iframe>');
        $(".video-holder").height(bvmc.height());
        if ($(window).width() > 1024) {
            if ($(".video-holder").size() > 0)
                if (bvmc.height() / 9 * 16 > bvmc.width()) {
                    bvfc.height(bvmc.height()).width(bvmc.height() / 9 * 16);
                    bvfc.css({
                        "margin-left": -1 * $("iframe").width() / 2 + "px",
                        top: "-75px",
                        "margin-top": "0px"
                    });
                } else {
                    bvfc.width($(window).width()).height($(window).width() / 16 * 9);
                    bvfc.css({
                        "margin-left": -1 * $("iframe").width() / 2 + "px",
                        "margin-top": -1 * $("iframe").height() / 2 + "px",
                        top: "50%"
                    });
                }
        } else if ($(window).width() < 760) {
            $(".video-holder").height(bvmc.height());
            bvfc.height(bvmc.height());
        } else {
            $(".video-holder").height(bvmc.height());
            bvfc.height(bvmc.height());
        }
        vch.css("width", $(window).width() + "px");
        vch.css("height", Number(720 / 1280 * $(window).width()) + "px");
        if (vch.height() < $(window).height()) {
            vch.css("height", $(window).height() + "px");
            vch.css("width", Number(1280 / 720 * $(window).height()) + "px");
        }
    }
    videoint();
    // Share   ------------------
    $(".share-container").share({
        networks: ['facebook', 'pinterest', 'googleplus', 'twitter', 'linkedin']
    });
    var shrcn = $(".share-wrapper"),
        ssb = $(".showshare");
    function showShare() {
        hideMenu();
        shrcn.fadeIn(1).removeClass("isShare").addClass("invis-share");
        $(".share-title span").shuffleLetters({});
        ssb.addClass("clshbt");
        setTimeout(function () {
            $(".soa").each(function (a) {
                var b = $(this);
                setTimeout(function () {
                    b.addClass("soavis")
                }, 150 * a);
            });

        }, 300);
    }
    function hideShare() {
        shrcn.fadeOut(400).addClass("isShare").removeClass("invis-share");
        $(".soa").removeClass("soavis");
        ssb.removeClass("clshbt");
    }
    $(".close-share").on("click", function () {
        hideShare();
    });
    ssb.on("click", function () {

        if (shrcn.hasClass("isShare")) showShare();
        else hideShare();
        return false;
    });
    //   menu ------------------
    $("#menu").menu();
    $(".sliding-menu li a.nav").parent("li").addClass("submen-dec");
    var nbw = $(".nav-button"),
        nhw = $(".nav-holder"),
        nho = $(".nav-overlay");
    function showMenu() {
        hideShare();
        nho.fadeIn(500);
        nhw.animate({
            left: "0",
            opacity: 1
        }, {
            queue: false,
            duration: 600,
            easing: "easeInOutExpo"
        });
        nbw.removeClass("but-hol").addClass("cmenu");
        setTimeout(function () {
            $(".nav-title span").shuffleLetters({});
        }, 300);
    }
    function hideMenu() {
        nhw.animate({
            left: "-1064px",
            opacity: 0
        }, {
            queue: false,
            duration: 600,
            easing: "easeInOutExpo"
        });
        nbw.addClass("but-hol").removeClass("cmenu");
        nho.fadeOut(500);
    }
    nbw.on("click", function () {
        if (nbw.hasClass("but-hol")) showMenu();
        else hideMenu();
        return false;
    });
    nho.on("click", function () {
        hideMenu();
        return false;
    });
    $(".sliding-menu a ").mousemove(function (e) {
        $(this).shuffleLetters({});
    });
    var tooltips = document.querySelectorAll('.nav-overlay .tooltip');
    window.onmousemove = function (e) {
        var x = (e.clientX + 20) + 'px',
            y = (e.clientY + 20) + 'px';
        for (var i = 0; i < tooltips.length; i++) {
            tooltips[i].style.top = y;
            tooltips[i].style.left = x;
        }
    };
    // Styles ------------------
    function csselem() {
        $(".height-emulator").css({
            height: $(".fixed-footer").outerHeight(true)
        });
        $(".show-case-slider .show-case-item").css({
            height: $(".show-case-slider").outerHeight(true)
        });
        $(".fullscreen-slider-item").css({
            height: $(".fullscreen-slider").outerHeight(true)
        });
        $(".half-slider-item").css({
            height: $(".half-slider-wrap").outerHeight(true)
        });
        $(".half-slider-img-item").css({
            height: $(".half-slider-img").outerHeight(true)
        });
        $(".hidden-info-wrap-bg").css({
            height: $(window).outerHeight(true) - 80 + "px"
        });
        $(".slideshow-item").css({
            height: $(".slideshow-container").outerHeight(true)
        });
        $(".fs-carousel-item").css({
            height: $(".fs-carousel").outerHeight(true)
        });
    }
    csselem();
    var $window = $(window);
    $window.resize(function () {
        csselem();
    });
    // Counter ------------------
    if ($(".counter-widget").length > 0) {
        var countCurrent = $(".counter-widget").attr("data-countDate");
        $(".countdown").downCount({
            date: countCurrent,
            offset: 0
        });
    }
    //   scroll to------------------
    $(".custom-scroll-link").on("click", function () {
        var a = 80;
        if (location.pathname.replace(/^\//, "") === this.pathname.replace(/^\//, "") || location.hostname === this.hostname) {
            var b = $(this.hash);
            b = b.length ? b : $("[name=" + this.hash.slice(1) + "]");
            if (b.length) {
                $("html,body").animate({
                    scrollTop: b.offset().top - a
                }, {
                    queue: false,
                    duration: 1200,
                    easing: "easeInOutExpo"
                });
                return false;
            }
        }
    });
    $(".scroll-init  ul").singlePageNav({
        filter: ":not(.external)",
        updateHash: false,
        offset: 80,
        threshold: 120,
        speed: 1200,
        currentClass: "act-scrlink"
    });
    $(".to-top").on("click", function (a) {
        a.preventDefault();
        $("html, body").animate({
            scrollTop: 0
        }, 800);
        return false;
    });
    $("<div class='to-top-letter'>t</div><div class='to-top-letter'>o</div><div class='to-top-letter'>p</div>").appendTo(".to-top span");
    //   Blog filter ------------------
    $(".blog-btn").on("click", function () {
        $(this).parent(".blog-btn-filter").find("ul").slideToggle(500);
        return false;
    });
    $('.hero-decor-let').rotaterator({fadeSpeed:500, pauseSpeed:1200});
}
//   Parallax ------------------
function initparallax() {
    var a = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return a.Android() || a.BlackBerry() || a.iOS() || a.Opera() || a.Windows();
        }
    };
    trueMobile = a.any();
    if (null === trueMobile) {
        var b = new Scrollax();
        b.reload();
        b.init();
    }
    if (trueMobile) $(".bgvid , .background-vimeo , .background-youtube-wrapper ").remove();
}
    //   instagram ------------------	
    var actoket = $('#insta-content').data("instatoken");
    var token = actoket,
        num_photos = 6;
    $.ajax({
        url: 'https://api.instagram.com/v1/users/self/media/recent',
        dataType: 'jsonp',
        type: 'GET',
        data: {
            access_token: token,
            count: num_photos
        },
        success: function (data) {
            for (x in data.data) {
                $('#insta-content').append('<a target="_blank" href="' + data.data[x].link + '"><img src="' + data.data[x].images.low_resolution.url + '"></a>');
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
    //   audio player ------------------
    if ($(".audio-player-wrap").length > 0) {
        function initAudiolist() {
            audiojs.events.ready(function () {
                var a = audiojs.createAll({
                        trackEnded: function () {
                            var next = $('.audio-player-wrap ol li.playing').next();
                            if (!next.length) next = $('.audio-player-wrap ol li').first();
                            next.addClass('playing').siblings().removeClass('playing');
                            audio.load($('a.audio-link', next).attr('data-srcaudio'));
                            audio.play();
                        }
                    }),
                    audio = a[0],
                    ids = ['vol-0', 'vol-40', 'vol-70', 'vol-100'];
                for (var i = 0, ii = ids.length; i < ii; i++) {
                    var elem = document.getElementById(ids[i]),
                        volume = ids[i].split('-')[1];
                    elem.setAttribute('data-volume', volume / 100)
                    elem.onclick = function (e) {
                        audio.setVolume(this.getAttribute('data-volume'));
                        e.preventDefault();
                        return false;
                    }
                }
                var audio = a[0];
                first = $('.audio-player-wrap ol a.audio-link').attr('data-srcaudio');
                $('.audio-player-wrap ul li').first().addClass('playing');
                audio.load(first);
                $('.audio-player-wrap ol li a.audio-link').on("click", function (e) {
                    e.preventDefault();
                    if ($(this).parent("li").attr('class') === 'playing') {
                        $(this).parent("li").addClass('pause');
                        audio.playPause();
                    } else {
                        $(this).parent("li").removeClass('pause').addClass('playing').siblings().removeClass('playing').removeClass('pause');
                        audio.load($(this).attr('data-srcaudio'));
                        audio.play();
                    }
                });
            });
        }
        initAudiolist();
        $('.volume-control span').on('click', function () {
            $('.volume-control span').removeClass("allvolumne");
            var onStar = Number($(this).data('value'));
            var stars = $(this).parent().children('span');
            for (i = 0; i < stars.length; i++) {
                $(stars[i]).removeClass('selected');
            }
            for (i = 0; i < onStar; i++) {
                $(stars[i]).addClass('selected');
            }
            if ($(this).data("value") === 1) {
                $(this).addClass('allvolumne');
            }
        });
        var alblisttitle = $(".playlist-wrap ol").data("listalbumtitle");
        $(".album-list-title").text("(" + alblisttitle + ")");
    }
    var audprev = $("#preview-sound");
    $('.album-preview').on({
        mouseenter: function () {
            var audioprevpath = $(this).data("audiopath");
            audprev.attr("src", audioprevpath);
            audprev[0].play();
        },
        mouseleave: function () {
            audprev[0].pause();
            audprev[0].currentTime = 0;
        }
    });
//   Init All ------------------
$(function () {
    initparallax();
    initSolonick();
});