(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5800);
  }

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q') || '';
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.search-input'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards(value) {
    var query = normalize(value);
    var matched = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));
      var visible = !query || haystack.indexOf(query) !== -1;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        matched += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = matched ? 'none' : 'block';
    }
  }

  if (queryFromUrl) {
    searchInputs.forEach(function (input) {
      input.value = queryFromUrl;
    });
    filterCards(queryFromUrl);
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      if (cards.length) {
        filterCards(input.value);
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.site-search')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('.search-input');
      if (cards.length) {
        event.preventDefault();
        filterCards(input ? input.value : '');
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-keyword]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var keyword = button.getAttribute('data-filter-keyword') || '';
      Array.prototype.slice.call(document.querySelectorAll('[data-filter-keyword]')).forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      searchInputs.forEach(function (input) {
        input.value = keyword;
      });
      filterCards(keyword);
    });
  });

  var video = document.querySelector('[data-player]');
  var overlay = document.querySelector('.player-overlay');
  var playTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-play-trigger]'));
  var hlsInstance = null;

  function prepareVideo() {
    if (!video || video.getAttribute('data-ready') === '1') {
      return;
    }

    var stream = video.getAttribute('data-stream');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else {
      video.src = stream;
    }

    video.setAttribute('data-ready', '1');
  }

  function startVideo() {
    if (!video) {
      return;
    }

    prepareVideo();
    video.controls = true;

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  playTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', startVideo);
  });

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
    }
  });

  var backTop = document.createElement('a');
  backTop.className = 'back-top';
  backTop.href = '#top';
  backTop.setAttribute('aria-label', '返回顶部');
  backTop.textContent = '↑';
  document.body.appendChild(backTop);

  window.addEventListener('scroll', function () {
    backTop.classList.toggle('is-visible', window.scrollY > 520);
  });
})();
