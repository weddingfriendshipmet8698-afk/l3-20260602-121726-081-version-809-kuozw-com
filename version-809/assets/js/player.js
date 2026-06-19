function initMoviePlayer(video, button, cover, source) {
  var started = false;

  function play() {
    if (started) {
      video.play();
      return;
    }

    started = true;

    function startNative() {
      video.src = source;
      video.play();
    }

    function startHls() {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
      } else {
        startNative();
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      startNative();
    } else if (window.Hls) {
      startHls();
    } else {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.onload = startHls;
      document.head.appendChild(script);
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });
}
