(function() {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dots button'));
    var prev = carousel.querySelector('.hero-control.prev');
    var next = carousel.querySelector('.hero-control.next');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function(slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function(dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function(dot, itemIndex) {
      dot.addEventListener('click', function() {
        show(itemIndex);
        start();
      });
    });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var panel = document.querySelector('[data-filter-panel]');
  var cardList = document.querySelector('[data-card-list]');
  if (panel && cardList) {
    var searchInput = panel.querySelector('[data-search-input]');
    var regionFilter = panel.querySelector('[data-region-filter]');
    var yearFilter = panel.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-card]'));

    function text(value) {
      return (value || '').toString().toLowerCase();
    }

    function apply() {
      var keyword = text(searchInput ? searchInput.value : '');
      var region = regionFilter ? regionFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      cards.forEach(function(card) {
        var haystack = text([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesRegion = !region || card.getAttribute('data-region') === region;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        card.style.display = matchesKeyword && matchesRegion && matchesYear ? '' : 'none';
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', apply);
    }
    if (regionFilter) {
      regionFilter.addEventListener('change', apply);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }
  }
})();
