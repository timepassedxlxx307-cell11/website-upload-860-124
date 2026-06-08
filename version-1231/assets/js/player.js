(function () {
    window.initMoviePlayer = function (videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var loaded = false;
        var hlsInstance = null;

        if (!video || !button || !source) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            loaded = true;
        }

        function startPlay() {
            loadSource();
            video.controls = true;
            button.classList.add("is-hidden");

            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", startPlay);
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlay();
            }
        });
        video.addEventListener("ended", function () {
            button.classList.remove("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    };
})();
