(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var show = function (index) {
            current = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        };
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')));
            });
        });
        window.setInterval(function () {
            show((current + 1) % slides.length);
        }, 5200);
    }

    var normalize = function (value) {
        return String(value || '').trim().toLowerCase();
    };

    var filterCards = function (root, value) {
        var term = normalize(value);
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-tags'));
            var ok = !term || haystack.indexOf(term) !== -1;
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });
        var existing = root.querySelector('.no-results');
        if (existing) {
            existing.remove();
        }
        if (!visible && cards.length) {
            var div = document.createElement('div');
            div.className = 'no-results';
            div.textContent = '没有找到匹配内容';
            root.appendChild(div);
        }
    };

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    searchInputs.forEach(function (input) {
        var scope = document;
        var section = input.closest('section');
        if (section && section.querySelector('.searchable-list')) {
            scope = section;
        }
        var target = scope.querySelector('.searchable-list') || document.querySelector('.searchable-list');
        input.addEventListener('input', function () {
            if (target) {
                filterCards(target, input.value);
            }
        });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-clear-search]')).forEach(function (button) {
        button.addEventListener('click', function () {
            var form = button.closest('form');
            var input = form ? form.querySelector('[data-search-input]') : null;
            var section = button.closest('section') || document;
            var target = section.querySelector('.searchable-list') || document.querySelector('.searchable-list');
            if (input) {
                input.value = '';
            }
            if (target) {
                filterCards(target, '');
            }
        });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-sort-select]')).forEach(function (select) {
        select.addEventListener('change', function () {
            var section = select.closest('section') || document;
            var list = section.querySelector('.sortable-list');
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var key = select.value;
            cards.sort(function (a, b) {
                var av = Number(a.getAttribute('data-' + key));
                var bv = Number(b.getAttribute('data-' + key));
                return bv - av;
            });
            cards.forEach(function (card) {
                list.appendChild(card);
            });
        });
    });
})();

function initVideoPlayer(sourceUrl, posterUrl) {
    var video = document.getElementById('videoPlayer');
    var overlay = document.getElementById('playOverlay');
    if (!video) {
        return;
    }
    var started = false;
    var hlsInstance = null;

    var load = function () {
        if (started) {
            return;
        }
        started = true;
        if (posterUrl) {
            video.setAttribute('poster', posterUrl);
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    };

    var start = function () {
        load();
        if (overlay) {
            overlay.classList.add('hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    };

    if (overlay) {
        overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('hidden');
        }
    });
    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
