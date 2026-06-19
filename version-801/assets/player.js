function initPlayer(source) {
  var video = document.getElementById('videoPlayer');
  var button = document.querySelector('[data-play-button]');

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function start() {
    attachSource();
    if (button) {
      button.classList.add('is-hidden');
    }
    var request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });
}
