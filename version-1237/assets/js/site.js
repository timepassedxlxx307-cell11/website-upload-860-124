(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function cardHtml(item) {
    var tags = (item.tags || []).slice(0, 2).map(function (tag) {
      return '<span>' + tag + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-card data-title="' + item.title + '" data-region="' + item.region + '" data-type="' + item.type + '" data-year="' + item.year + '" data-tags="' + (item.tags || []).join(' ') + '">',
      '  <a href="' + item.url + '" class="poster-link" aria-label="观看' + item.title + '">',
      '    <figure class="poster-frame">',
      '      <img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
      '      <figcaption class="play-hover"><span>▶</span></figcaption>',
      '      <i class="year-badge">' + item.year + '</i>',
      '    </figure>',
      '  </a>',
      '  <div class="movie-info">',
      '    <h3><a href="' + item.url + '">' + item.title + '</a></h3>',
      '    <p>' + item.oneLine + '</p>',
      '    <div class="card-meta"><span>' + item.region + '</span><span>' + item.type + '</span>' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function initNavigation() {
    var toggle = one('.nav-toggle');
    var panel = one('.mobile-panel');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var open = panel.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.textContent = open ? '×' : '☰';
      });
    }

    all('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        if (!query) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        var base = form.getAttribute('data-search-base') || form.getAttribute('action') || 'search.html';
        window.location.href = base + '?q=' + encodeURIComponent(query);
      });
    });
  }

  function initHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var prev = one('[data-hero-prev]', hero);
    var next = one('[data-hero-next]', hero);
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function initFilters() {
    all('[data-filter-panel]').forEach(function (panel) {
      var input = one('[data-filter-input]', panel);
      var year = one('[data-filter-year]', panel);
      var type = one('[data-filter-type]', panel);
      var scope = panel.parentElement || document;
      var cards = all('[data-card]', scope);
      var empty = one('[data-filter-empty]', scope);

      function apply() {
        var keyword = normalize(input && input.value);
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-category')
          ].join(' '));
          var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var passYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var passType = !typeValue || normalize(card.getAttribute('data-type')).indexOf(normalize(typeValue)) !== -1;
          var pass = passKeyword && passYear && passType;
          card.style.display = pass ? '' : 'none';
          if (pass) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function initSearchPage() {
    var results = one('#searchResults');
    if (!results || !window.JZ_SEARCH_INDEX) {
      return;
    }

    var input = one('#searchInput');
    var params = new URLSearchParams(window.location.search);
    var currentQuery = params.get('q') || '';

    if (input) {
      input.value = currentQuery;
    }

    function render(query) {
      var value = normalize(query);
      var matches = window.JZ_SEARCH_INDEX.filter(function (item) {
        var text = normalize([item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(' '), item.oneLine].join(' '));
        return !value || text.indexOf(value) !== -1;
      }).slice(0, 120);

      if (!matches.length) {
        results.innerHTML = '<div class="filter-empty" style="display:block">没有找到匹配的影片，请尝试更换关键词。</div>';
        return;
      }

      results.innerHTML = matches.map(cardHtml).join('');
    }

    render(currentQuery);

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  function initPlayers() {
    all('[data-player]').forEach(function (player) {
      var video = one('video', player);
      var overlay = one('[data-play-overlay]', player);
      var status = one('[data-player-status]', player);
      var stream = player.getAttribute('data-stream');
      var started = false;
      var hlsInstance = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function attachStream() {
        if (!video || !stream || started) {
          return;
        }
        started = true;
        setStatus('正在加载视频');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 45,
            backBufferLength: 30
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function () {
            setStatus('视频加载遇到网络波动，可稍后重试');
          });
        } else {
          video.src = stream;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          video.load();
        }
      }

      function playVideo() {
        if (!video) {
          return;
        }
        var promise = video.play();
        if (promise && typeof promise.then === 'function') {
          promise.then(function () {
            if (overlay) {
              overlay.classList.add('hidden');
            }
            setStatus('正在播放');
          }).catch(function () {
            setStatus('点击播放');
          });
        }
      }

      function toggleVideo() {
        attachStream();
        if (!video) {
          return;
        }
        if (!video.paused) {
          video.pause();
          if (overlay) {
            overlay.classList.remove('hidden');
          }
          setStatus('已暂停');
        } else if (started) {
          playVideo();
        }
      }

      if (overlay) {
        overlay.addEventListener('click', function () {
          attachStream();
          playVideo();
        });
      }

      if (video) {
        video.addEventListener('click', toggleVideo);
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('hidden');
          }
          setStatus('正在播放');
        });
        video.addEventListener('pause', function () {
          if (overlay) {
            overlay.classList.remove('hidden');
          }
          setStatus('已暂停');
        });
      }

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
}());
