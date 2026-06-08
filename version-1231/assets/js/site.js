(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".site-nav");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var active = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        active = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === active);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === active);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var next = Number(dot.getAttribute("data-slide"));
            showSlide(next);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    document.querySelectorAll(".search-panel").forEach(function (panel) {
        var input = panel.querySelector(".movie-search");
        var clear = panel.querySelector(".search-clear");
        var scope = panel.closest(".container") && panel.closest(".container").nextElementSibling;

        if (!scope || !scope.classList.contains("searchable-scope")) {
            scope = document.querySelector(".searchable-scope");
        }

        if (!input || !scope) {
            return;
        }

        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

        function filterCards() {
            var keyword = normalize(input.value);

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region")
                ].join(" "));

                card.classList.toggle("is-filtered-out", keyword && text.indexOf(keyword) === -1);
            });
        }

        input.addEventListener("input", filterCards);

        if (clear) {
            clear.addEventListener("click", function () {
                input.value = "";
                filterCards();
                input.focus();
            });
        }
    });
})();
