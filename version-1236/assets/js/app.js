(function () {
    function onReady(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function move(step) {
            show(index + step);
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 5600);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                move(1);
                start();
            });
        }
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll(".filter-grid"));
        if (!grids.length) {
            return;
        }
        var input = document.querySelector(".filter-input");
        var type = document.querySelector(".filter-type");
        var year = document.querySelector(".filter-year");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input && query) {
            input.value = query;
        }
        function apply() {
            var q = normalize(input ? input.value : "");
            var t = normalize(type ? type.value : "");
            var y = normalize(year ? year.value : "");
            grids.forEach(function (grid) {
                Array.prototype.slice.call(grid.querySelectorAll(".movie-card")).forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year")
                    ].join(" "));
                    var okText = !q || haystack.indexOf(q) !== -1;
                    var okType = !t || normalize(card.getAttribute("data-type")) === t;
                    var okYear = !y || normalize(card.getAttribute("data-year")) === y;
                    card.style.display = okText && okType && okYear ? "" : "none";
                });
            });
        }
        [input, type, year].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
        apply();
    }

    window.initMoviePlayer = function (videoId, source, maskId) {
        onReady(function () {
            var video = document.getElementById(videoId);
            var mask = document.getElementById(maskId);
            if (!video || !source) {
                return;
            }
            var loaded = false;
            var hls = null;
            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }
            function play() {
                load();
                if (mask) {
                    mask.classList.add("is-hidden");
                }
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function () {});
                }
            }
            if (mask) {
                mask.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (!loaded || video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (mask) {
                    mask.classList.add("is-hidden");
                }
            });
            load();
        });
    };

    onReady(function () {
        initNavigation();
        initHero();
        initFilters();
    });
})();
