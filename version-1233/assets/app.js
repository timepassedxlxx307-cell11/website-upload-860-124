(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  all('[data-nav-toggle]').forEach(function (button) {
    var target = document.querySelector(button.getAttribute('data-nav-toggle'));
    if (!target) {
      return;
    }
    button.addEventListener('click', function () {
      target.classList.toggle('is-open');
    });
  });

  all('[data-hero-slider]').forEach(function (slider) {
    var slides = all('.hero-slide', slider);
    var dots = all('.hero-dot', slider);
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  });

  all('[data-library]').forEach(function (library) {
    var input = library.querySelector('[data-card-search]');
    var filters = all('[data-card-filter]', library);
    var sort = library.querySelector('[data-card-sort]');
    var grid = library.querySelector('[data-card-grid]');
    var empty = library.querySelector('[data-filter-empty]');

    if (!grid) {
      return;
    }

    function cards() {
      return all('[data-movie-card]', grid);
    }

    function apply() {
      var query = input ? normalize(input.value) : '';
      var activeFilters = filters.map(function (filter) {
        return {
          key: filter.getAttribute('data-card-filter'),
          value: normalize(filter.value)
        };
      }).filter(function (filter) {
        return filter.value !== '';
      });
      var visible = 0;

      cards().forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesFilter = activeFilters.every(function (filter) {
          return normalize(card.getAttribute('data-' + filter.key)).indexOf(filter.value) !== -1;
        });
        var showCard = matchesQuery && matchesFilter;
        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    function sortCards() {
      if (!sort) {
        return;
      }
      var value = sort.value;
      var sorted = cards().sort(function (a, b) {
        if (value === 'year') {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        }
        if (value === 'title') {
          return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
        }
        return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      apply();
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    filters.forEach(function (filter) {
      filter.addEventListener('change', apply);
    });
    if (sort) {
      sort.addEventListener('change', sortCards);
      sortCards();
    }
    apply();
  });
})();
