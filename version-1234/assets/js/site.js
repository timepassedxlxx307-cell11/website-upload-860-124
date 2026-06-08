(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var menu = document.querySelector(".nav-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = selectAll("[data-hero-slide]");
    var dots = selectAll("[data-hero-dot]");
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    var previous = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (previous) {
      previous.addEventListener("click", function () {
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
    start();
  }

  function setupSearch() {
    if (typeof SEARCH_MOVIES === "undefined" || !Array.isArray(SEARCH_MOVIES)) {
      return;
    }
    selectAll(".header-search").forEach(function (form) {
      var input = form.querySelector(".site-search-input");
      var panel = form.querySelector(".site-search-results");
      if (!input || !panel) {
        return;
      }

      function render() {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          panel.classList.remove("is-open");
          panel.innerHTML = "";
          return;
        }
        var results = SEARCH_MOVIES.filter(function (movie) {
          var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
          return haystack.indexOf(query) !== -1;
        }).slice(0, 8);
        if (!results.length) {
          panel.innerHTML = '<div class="empty-state">暂无匹配影片</div>';
          panel.classList.add("is-open");
          return;
        }
        panel.innerHTML = results.map(function (movie) {
          return '<a class="search-result-item" href="' + escapeHtml(movie.href) + '">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">' +
            '<span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</span></span>' +
            '</a>';
        }).join("");
        panel.classList.add("is-open");
      }

      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = panel.querySelector("a");
        if (first) {
          window.location.href = first.getAttribute("href");
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function setupCatalogFilters() {
    selectAll(".catalog-section").forEach(function (section) {
      var cards = selectAll(".movie-card", section);
      if (!cards.length) {
        return;
      }
      var input = section.querySelector(".catalog-search");
      var filters = selectAll(".catalog-filter", section);
      var emptyState = section.querySelector(".empty-state");

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var shown = 0;
        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.tags].join(" ").toLowerCase();
          var matchText = !query || text.indexOf(query) !== -1;
          var matchFilters = filters.every(function (filter) {
            var value = filter.value;
            var key = filter.getAttribute("data-filter");
            if (!value || !key) {
              return true;
            }
            return card.dataset[key] === value;
          });
          var visible = matchText && matchFilters;
          card.classList.toggle("is-hidden", !visible);
          if (visible) {
            shown += 1;
          }
        });
        if (emptyState) {
          emptyState.hidden = shown !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      filters.forEach(function (filter) {
        filter.addEventListener("change", apply);
      });
      apply();
    });
  }

  window.initMoviePlayer = function (videoId, coverId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hls = null;
    var ready = false;

    if (!video || !sourceUrl) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        ready = true;
        return;
      }
      if (typeof Hls !== "undefined" && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        ready = true;
        return;
      }
      video.src = sourceUrl;
      ready = true;
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupCatalogFilters();
  });
})();
