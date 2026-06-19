(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    setupImages();
    setupMenu();
    setupHero();
    setupCardFilters();
    setupSearchForms();
    setupSearchPage();
    setupMoviePlayers();
  });

  function setupImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-missing");
      });
    });
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupCardFilters() {
    document.querySelectorAll("[data-card-filter-form]").forEach(function (form) {
      var input = form.querySelector("[data-card-filter]");
      var scope = form.closest("main") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-tip]");
      if (!input || !cards.length) {
        return;
      }

      function apply() {
        var q = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-tags") || "")).toLowerCase();
          var hit = !q || text.indexOf(q) !== -1;
          card.style.display = hit ? "" : "none";
          if (hit) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      input.addEventListener("input", apply);
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var q = input ? input.value.trim() : "";
        if (!q) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    var empty = document.querySelector("[data-search-empty]");
    var form = document.querySelector("[data-search-page-form]");
    if (!results || !input || !window.searchItems) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = "";
        if (empty) {
          empty.textContent = "请输入关键词开始搜索";
          empty.classList.add("is-visible");
        }
        return;
      }
      var items = window.searchItems.filter(function (item) {
        return item.searchText.indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = items.map(renderSearchCard).join("");
      if (empty) {
        empty.textContent = "没有找到匹配的影片";
        empty.classList.toggle("is-visible", items.length === 0);
      }
      setupImages();
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var q = input.value.trim();
        var nextUrl = q ? "./search.html?q=" + encodeURIComponent(q) : "./search.html";
        window.history.replaceState(null, "", nextUrl);
        render();
      });
    }
    input.addEventListener("input", render);
    render();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderSearchCard(item) {
    return "<article class=\"movie-card\" data-movie-card>" +
      "<a class=\"poster\" href=\"" + escapeHtml(item.url) + "\" style=\"--poster-image: url('" + escapeHtml(item.cover) + "')\">" +
      "<img class=\"poster-img\" src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-badge\">" + escapeHtml(item.category) + "</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + item.tags.slice(0, 3).map(function (tag) { return "<span>" + escapeHtml(tag) + "</span>"; }).join("") + "</div>" +
      "</div>" +
      "</article>";
  }

  function setupMoviePlayers() {
    document.querySelectorAll("[data-player-shell]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var attached = false;
      var hls = null;

      function attachStream() {
        if (!stream || attached) {
          return Promise.resolve();
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            window.setTimeout(resolve, 1800);
          });
        }
        video.src = stream;
        video.load();
        return Promise.resolve();
      }

      function play() {
        if (!stream) {
          return;
        }
        if (button) {
          button.classList.add("is-hidden");
        }
        attachStream().then(function () {
          var attempt = video.play();
          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {
              video.controls = true;
            });
          }
        });
      }

      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      video.addEventListener("error", function () {
        if (hls) {
          hls.destroy();
          hls = null;
          attached = false;
        }
      });
    });
  }
})();
