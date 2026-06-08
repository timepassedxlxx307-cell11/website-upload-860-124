(function () {
  window.setupMoviePlayer = function (videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;
    var loaded = false;

    if (!video || !source) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function loadSource() {
      if (!loaded) {
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 42,
            backBufferLength: 30
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      hideOverlay();
      playVideo();
    }

    if (overlay) {
      overlay.addEventListener('click', loadSource);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        loadSource();
      }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('ended', function () {
      if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
        hlsInstance.stopLoad();
      }
    });
  };
})();
