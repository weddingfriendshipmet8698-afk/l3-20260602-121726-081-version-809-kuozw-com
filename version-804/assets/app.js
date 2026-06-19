(function () {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-main-nav]");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  const filterForm = document.querySelector("[data-filter-form]");
  const grid = document.querySelector("[data-movie-grid]");

  if (filterForm && grid) {
    const input = filterForm.querySelector("[data-filter-input]");
    const year = filterForm.querySelector("[data-filter-year]");
    const region = filterForm.querySelector("[data-filter-region]");
    const sort = filterForm.querySelector("[data-filter-sort]");
    const empty = document.querySelector("[data-empty-state]");
    const cards = Array.from(grid.querySelectorAll("[data-movie-card]"));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");

    if (initialQuery && input) {
      input.value = initialQuery;
    }

    function scoreCard(card, mode) {
      if (mode === "rating") {
        return Number(card.dataset.rating || 0);
      }
      if (mode === "views") {
        return Number(card.dataset.views || 0);
      }
      if (mode === "year") {
        return Number(card.dataset.year || 0);
      }
      return -cards.indexOf(card);
    }

    function applyFilters() {
      const query = (input ? input.value : "").trim().toLowerCase();
      const selectedYear = year ? year.value : "";
      const selectedRegion = region ? region.value : "";
      const selectedSort = sort ? sort.value : "default";
      let visibleCount = 0;
      const sortedCards = cards.slice().sort(function (left, right) {
        return scoreCard(right, selectedSort) - scoreCard(left, selectedSort);
      });

      sortedCards.forEach(function (card) {
        const text = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.year].join(" ").toLowerCase();
        const matchesQuery = !query || text.indexOf(query) !== -1;
        const matchesYear = !selectedYear || card.dataset.year === selectedYear;
        const matchesRegion = !selectedRegion || card.dataset.region === selectedRegion;
        const visible = matchesQuery && matchesYear && matchesRegion;

        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
        grid.appendChild(card);
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    [input, year, region, sort].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }
})();

function initializeMoviePlayer(streamUrl) {
  const video = document.getElementById("movie-player");
  const trigger = document.querySelector("[data-play-trigger]");

  if (!video || !streamUrl) {
    return;
  }

  let hlsInstance = null;

  function loadStream() {
    if (video.dataset.ready === "true") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    video.dataset.ready = "true";
  }

  function startPlayback() {
    loadStream();

    if (trigger) {
      trigger.classList.add("is-hidden");
    }

    video.controls = true;
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (trigger) {
          trigger.classList.remove("is-hidden");
        }
      });
    }
  }

  if (trigger) {
    trigger.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    if (trigger) {
      trigger.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (trigger && video.currentTime === 0) {
      trigger.classList.remove("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
