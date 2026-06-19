(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showHero(index) {
      active = index % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHero(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showHero(active + 1);
      }, 5200);
    }
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var yearFilters = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));
  var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));

  function applyFilters() {
    var query = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).find(Boolean) || '';

    var selectedYear = yearFilters.map(function (select) {
      return select.value;
    }).find(Boolean) || '';

    lists.forEach(function (list) {
      var items = Array.prototype.slice.call(list.children);
      items.forEach(function (item) {
        var text = [
          item.getAttribute('data-title'),
          item.getAttribute('data-year'),
          item.getAttribute('data-region'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-tags'),
          item.textContent
        ].join(' ').toLowerCase();
        var year = item.getAttribute('data-year') || '';
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !selectedYear || year === selectedYear;
        item.classList.toggle('is-hidden-by-filter', !(matchQuery && matchYear));
      });
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  yearFilters.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });
})();
