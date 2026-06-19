(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var track = hero.querySelector('[data-hero-track]');
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function setHero(next) {
      index = next;
      if (track) {
        track.style.transform = 'translateX(' + (-100 * index) + '%)';
      }
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        setHero(dotIndex);
      });
    });

    if (dots.length > 1) {
      setInterval(function () {
        setHero((index + 1) % dots.length);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var yearSelect = document.querySelector('[data-year-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

  function filterCards() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();
      var yearOk = !year || card.getAttribute('data-year') === year;
      var keywordOk = !keyword || text.indexOf(keyword) !== -1;
      card.classList.toggle('hidden-card', !(yearOk && keywordOk));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', filterCards);
  }
})();
