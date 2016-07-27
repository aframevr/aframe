var registerComponent = require('../../core/component').registerComponent;

var FULLSCREEN_CLASS = 'fullscreen';
var GRABBING_CLASS = 'a-canvas-grabbing';

/**
 * Create canvas that toggles full screen styles when entering and exiting VR.
 */
module.exports.Component = registerComponent('canvas', {
  init: function () {
    var sceneEl = this.el;
    var canvasEl = document.createElement('canvas');

    canvasEl.classList.add('a-canvas');
    // Mark canvas as provided/injected by A-Frame.
    canvasEl.dataset.aframeCanvas = true;
    sceneEl.appendChild(canvasEl);

    document.addEventListener('fullscreenchange', onFullScreenChange);
    document.addEventListener('mozfullscreenchange', onFullScreenChange);
    document.addEventListener('webkitfullscreenchange', onFullScreenChange);

    // Listen to mousedown to enable grab/grabbing cursors.
    canvasEl.addEventListener('mousedown', function addGrabbingClass (event) {
      document.body.classList.add(GRABBING_CLASS);
    });
    document.body.addEventListener('mouseup', function removeGrabbingClass (event) {
      document.body.classList.remove(GRABBING_CLASS);
    });

    // Handle fullscreeen styling.
    sceneEl.addEventListener('enter-vr', function addFullscreenClass () {
      canvasEl.classList.add(FULLSCREEN_CLASS);
    });
    sceneEl.addEventListener('exit-vr', function removeFullscreenClass () {
      canvasEl.classList.remove(FULLSCREEN_CLASS);
    });

    // Set canvas on scene.
    sceneEl.canvas = canvasEl;
    sceneEl.emit('render-target-loaded', {target: canvasEl});

    function onFullScreenChange () {
      var fullscreenEl =
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement;

      // If no fullscreen element, exit fullscreen.
      if (!fullscreenEl) { sceneEl.exitVR(); }

      document.activeElement.blur();
      document.body.focus();
      // For unknown reasons, resizing synchronously does not work on desktop when
      // entering/exiting fullscreen.
      setTimeout(sceneEl.resize.bind(sceneEl), 0);
    }
  }
});
