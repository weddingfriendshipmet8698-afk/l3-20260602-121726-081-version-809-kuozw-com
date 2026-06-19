(function () {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
        toggle.addEventListener("click", function () {
            links.classList.toggle("open");
        });
    }

    document.querySelectorAll(".nav-drop > button").forEach(function (button) {
        button.addEventListener("click", function () {
            var parent = button.closest(".nav-drop");
            if (parent) {
                parent.classList.toggle("open");
            }
        });
    });

    var hero = document.querySelector(".hero");
    if (hero) {
        var track = hero.querySelector(".hero-track");
        var dots = hero.querySelectorAll(".hero-dots button");
        var index = 0;
        var move = function (next) {
            index = next % dots.length;
            if (index < 0) {
                index = dots.length - 1;
            }
            if (track) {
                track.style.transform = "translateX(-" + index * 100 + "%)";
            }
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                move(i);
            });
        });
        if (dots.length > 1) {
            window.setInterval(function () {
                move(index + 1);
            }, 5200);
        }
    }

    var quickForm = document.querySelector(".quick-search");
    if (quickForm) {
        quickForm.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = quickForm.querySelector("input");
            var keyword = input ? input.value.trim() : "";
            var target = quickForm.getAttribute("action") || "search.html";
            window.location.href = target + (keyword ? "?q=" + encodeURIComponent(keyword) : "");
        });
    }

    var searchPanel = document.querySelector(".search-box");
    if (searchPanel) {
        var input = searchPanel.querySelector("input");
        var category = searchPanel.querySelector("select[name='category']");
        var year = searchPanel.querySelector("select[name='year']");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector(".empty-tip");
        var params = new URLSearchParams(window.location.search);
        if (input && params.get("q")) {
            input.value = params.get("q");
        }
        var apply = function () {
            var q = input ? input.value.trim().toLowerCase() : "";
            var c = category ? category.value : "";
            var y = year ? year.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.genre, card.dataset.category].join(" ").toLowerCase();
                var ok = (!q || text.indexOf(q) !== -1) && (!c || card.dataset.category === c) && (!y || card.dataset.year === y);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        };
        [input, category, year].forEach(function (el) {
            if (el) {
                el.addEventListener("input", apply);
                el.addEventListener("change", apply);
            }
        });
        apply();
    }

    var video = document.getElementById("mainVideo");
    var playLayer = document.getElementById("playLayer");
    if (video) {
        var sourceTag = video.querySelector("source");
        var streamUrl = sourceTag ? sourceTag.getAttribute("src") : video.getAttribute("src");
        var ready = false;
        var setup = function () {
            if (ready || !streamUrl) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            ready = true;
        };
        var start = function () {
            setup();
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        };
        if (playLayer) {
            playLayer.addEventListener("click", function () {
                playLayer.classList.add("is-hidden");
                start();
            });
        }
        video.addEventListener("click", setup);
        video.addEventListener("play", function () {
            if (playLayer) {
                playLayer.classList.add("is-hidden");
            }
        });
    }
})();
