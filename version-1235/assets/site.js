(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-nav-toggle]');

  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, '');
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
  var typeSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]'));
  var regionSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-region]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function currentValue(nodes) {
    for (var i = 0; i < nodes.length; i += 1) {
      if (nodes[i].value) {
        return nodes[i].value;
      }
    }
    return '';
  }

  function filterCards() {
    var query = normalize(currentValue(filterInputs));
    var type = currentValue(typeSelects);
    var region = currentValue(regionSelects);

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type')
      ].join(' '));
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchType = !type || card.getAttribute('data-type') === type;
      var matchRegion = !region || card.getAttribute('data-region').indexOf(region) !== -1 || text.indexOf(normalize(region)) !== -1;
      card.hidden = !(matchQuery && matchType && matchRegion);
    });
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var value = input.value;
      filterInputs.forEach(function (other) {
        if (other !== input) {
          other.value = value;
        }
      });
      filterCards();
    });
  });

  typeSelects.concat(regionSelects).forEach(function (select) {
    select.addEventListener('change', filterCards);
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-button');
    var hlsUrl = video ? video.getAttribute('data-hls') : '';
    var attached = false;
    var pending = false;
    var hls = null;

    if (!video || !hlsUrl) {
      return;
    }

    function markPlaying() {
      player.classList.add('is-playing');
    }

    function attachMedia() {
      if (attached) {
        return;
      }
      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(hlsUrl);
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (pending) {
            video.play().then(markPlaying).catch(function () {});
          }
        });
      } else {
        video.src = hlsUrl;
      }
    }

    function play() {
      pending = true;
      attachMedia();
      var attempt = video.play();
      if (attempt && attempt.then) {
        attempt.then(markPlaying).catch(function () {});
      } else {
        markPlaying();
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    player.addEventListener('click', function (event) {
      if (event.target === video || event.target === player || event.target.classList.contains('player-stage')) {
        play();
      }
    });

    video.addEventListener('play', markPlaying);
    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
