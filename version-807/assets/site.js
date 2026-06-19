document.addEventListener('DOMContentLoaded', function () {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-target')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var filterList = document.querySelector('[data-filter-list]');

  function applyFilter() {
    if (!filterList) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags')).toLowerCase();
      var cardYear = card.getAttribute('data-year');
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedYear = !year || cardYear === year;
      card.style.display = matchedKeyword && matchedYear ? '' : 'none';
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilter);
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var trigger = player.querySelector('.play-cover');
    var streamUrl = player.getAttribute('data-stream-url');
    var hlsInstance = null;

    function startVideo() {
      if (!video || !streamUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      player.classList.add('is-playing');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', startVideo);
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  if (window.SEARCH_ITEMS) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchInput = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');

    if (searchInput) {
      searchInput.value = query;
    }

    function renderSearch(value) {
      if (!results) {
        return;
      }

      var q = value.trim().toLowerCase();
      var matched = window.SEARCH_ITEMS.filter(function (item) {
        return !q || item.text.indexOf(q) !== -1;
      }).slice(0, 120);

      if (status) {
        status.textContent = q ? '已显示匹配影片，可继续调整关键词。' : '输入关键词后显示匹配影片。';
      }

      results.innerHTML = matched.map(function (item) {
        return '<article class="movie-card" data-title="' + item.titleEsc + '" data-year="' + item.year + '" data-tags="' + item.tagsEsc + '">' +
          '<a class="poster" href="movies/' + item.file + '" data-title="' + item.titleEsc + '">' +
          '<img src="' + item.cover + '.jpg" alt="' + item.titleEsc + '" loading="lazy" onerror="this.parentElement.classList.add('cover-empty'); this.remove();" />' +
          '<span class="poster-badge">' + item.year + '</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<a class="movie-title" href="movies/' + item.file + '">' + item.titleEsc + '</a>' +
          '<p>' + item.lineEsc + '</p>' +
          '<div class="meta-row"><a href="category/' + item.categorySlug + '.html">' + item.categoryEsc + '</a><span>' + item.regionEsc + '</span><span>' + item.typeEsc + '</span></div>' +
          '<div class="tag-row">' + item.tagHtml + '</div>' +
          '</div>' +
          '</article>';
      }).join('');
    }

    renderSearch(query);

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        renderSearch(searchInput.value);
      });
    }
  }
});
