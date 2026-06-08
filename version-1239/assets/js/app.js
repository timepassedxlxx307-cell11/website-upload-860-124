(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        function update() {
            if (window.scrollY > 520) {
                button.classList.add("is-active");
            } else {
                button.classList.remove("is-active");
            }
        }
        window.addEventListener("scroll", update, { passive: true });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        update();
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === index);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupRails() {
        document.querySelectorAll(".rail-wrap").forEach(function (wrap) {
            var rail = wrap.querySelector("[data-rail]");
            var left = wrap.querySelector("[data-rail-left]");
            var right = wrap.querySelector("[data-rail-right]");
            if (!rail) {
                return;
            }
            if (left) {
                left.addEventListener("click", function () {
                    rail.scrollBy({ left: -360, behavior: "smooth" });
                });
            }
            if (right) {
                right.addEventListener("click", function () {
                    rail.scrollBy({ left: 360, behavior: "smooth" });
                });
            }
        });
    }

    function collectOptions(scope, selector, attr) {
        var select = scope.querySelector(selector);
        if (!select || select.children.length > 1) {
            return;
        }
        var values = [];
        scope.querySelectorAll("[data-title]").forEach(function (item) {
            var value = item.getAttribute(attr) || "";
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        values.sort(function (a, b) {
            return String(b).localeCompare(String(a), "zh-Hans-CN");
        });
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var search = scope.querySelector("[data-filter-search]");
            var type = scope.querySelector("[data-filter-type]");
            var year = scope.querySelector("[data-filter-year]");
            var region = scope.querySelector("[data-filter-region]");
            var parent = scope.parentElement || document;
            var items = Array.prototype.slice.call(parent.querySelectorAll("[data-filter-results] [data-title]"));
            var empty = parent.querySelector("[data-filter-empty]");
            collectOptions(parent, "[data-filter-type]", "data-type");
            collectOptions(parent, "[data-filter-year]", "data-year");
            collectOptions(parent, "[data-filter-region]", "data-region");

            function apply() {
                var keyword = normalize(search && search.value);
                var typeValue = type && type.value;
                var yearValue = year && year.value;
                var regionValue = region && region.value;
                var visible = 0;
                items.forEach(function (item) {
                    var text = normalize([
                        item.getAttribute("data-title"),
                        item.getAttribute("data-region"),
                        item.getAttribute("data-type"),
                        item.getAttribute("data-year"),
                        item.getAttribute("data-genre")
                    ].join(" "));
                    var match = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        match = false;
                    }
                    if (typeValue && item.getAttribute("data-type") !== typeValue) {
                        match = false;
                    }
                    if (yearValue && item.getAttribute("data-year") !== yearValue) {
                        match = false;
                    }
                    if (regionValue && item.getAttribute("data-region") !== regionValue) {
                        match = false;
                    }
                    item.classList.toggle("is-hidden", !match);
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-active", visible === 0);
                }
            }

            [search, type, year, region].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function movieCard(movie) {
        return "<article class=\"movie-card\">" +
            "<a class=\"movie-poster\" href=\"" + escapeHtml(movie.url) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"movie-play\">▶</span>" +
            "<span class=\"movie-badge\">" + escapeHtml(movie.type) + "</span>" +
            "<span class=\"movie-year\">" + escapeHtml(movie.year) + "</span>" +
            "</a>" +
            "<div class=\"movie-info\">" +
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
            "</div>" +
            "</article>";
    }

    function setupSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.SEARCH_INDEX) {
            return;
        }
        var input = page.querySelector("[data-search-input]");
        var type = page.querySelector("[data-search-type]");
        var year = page.querySelector("[data-search-year]");
        var region = page.querySelector("[data-search-region]");
        var results = page.querySelector("[data-search-results]");
        var empty = page.querySelector("[data-search-empty]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";

        function fill(select, key) {
            var values = [];
            window.SEARCH_INDEX.forEach(function (movie) {
                var value = movie[key] || "";
                if (value && values.indexOf(value) === -1) {
                    values.push(value);
                }
            });
            values.sort(function (a, b) {
                return String(b).localeCompare(String(a), "zh-Hans-CN");
            });
            values.forEach(function (value) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function render() {
            var keyword = normalize(input.value);
            var typeValue = type.value;
            var yearValue = year.value;
            var regionValue = region.value;
            var items = window.SEARCH_INDEX.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.oneLine
                ].join(" "));
                if (keyword && text.indexOf(keyword) === -1) {
                    return false;
                }
                if (typeValue && movie.type !== typeValue) {
                    return false;
                }
                if (yearValue && String(movie.year) !== yearValue) {
                    return false;
                }
                if (regionValue && movie.region !== regionValue) {
                    return false;
                }
                return true;
            });
            results.innerHTML = items.map(movieCard).join("");
            empty.classList.toggle("is-active", items.length === 0);
        }

        input.value = initial;
        fill(type, "type");
        fill(year, "year");
        fill(region, "region");
        [input, type, year, region].forEach(function (control) {
            control.addEventListener("input", render);
            control.addEventListener("change", render);
        });
        render();
    }

    window.initMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var playButton = document.getElementById(options.playButtonId);
        var loaded = false;
        var hls = null;

        if (!video || !overlay || !options.source) {
            return;
        }

        function showError() {
            overlay.classList.remove("is-hidden");
            overlay.innerHTML = "<span class=\"play-core\">!</span><strong>视频加载失败，请刷新页面重试</strong>";
        }

        function attach() {
            if (loaded) {
                return true;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = options.source;
                return true;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(options.source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        showError();
                    }
                });
                return true;
            }
            showError();
            return false;
        }

        function start() {
            if (!attach()) {
                return;
            }
            video.controls = true;
            overlay.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", start);
        if (playButton) {
            playButton.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMobileMenu();
        setupBackTop();
        setupHero();
        setupRails();
        setupFilters();
        setupSearchPage();
    });
})();
