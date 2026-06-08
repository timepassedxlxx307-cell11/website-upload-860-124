(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10));
        startTimer();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        showSlide(parseInt(thumb.getAttribute('data-hero-thumb'), 10));
        stopTimer();
      });
      thumb.addEventListener('mouseleave', startTimer);
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    if (slides.length > 1) {
      startTimer();
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var scope = panel.parentElement || document;
    var input = panel.querySelector('[data-search-input]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var reset = panel.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-empty-state]');

    function valueOf(el) {
      return el ? el.value.trim().toLowerCase() : '';
    }

    function applyFilter() {
      var keyword = valueOf(input);
      var type = valueOf(typeSelect);
      var region = valueOf(regionSelect);
      var category = valueOf(categorySelect);
      var visible = 0;

      cards.forEach(function (card) {
        var search = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
        var matched = true;

        if (keyword && search.indexOf(keyword) === -1) {
          matched = false;
        }

        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }

        if (region && cardRegion.indexOf(region) === -1) {
          matched = false;
        }

        if (category && cardCategory !== category) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, typeSelect, regionSelect, categorySelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', applyFilter);
        el.addEventListener('change', applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        applyFilter();
      });
    }
  });
})();

function initializePlayer(url, videoId, coverId) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var hlsInstance = null;
  var ready = false;

  if (!video || !cover || !url) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function start() {
    attach();
    cover.classList.add('is-hidden');
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  cover.addEventListener('click', start);

  video.addEventListener('play', function () {
    cover.classList.add('is-hidden');
  });

  video.addEventListener('error', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
