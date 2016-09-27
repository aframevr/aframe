var bind = require('../../utils/bind');
var register = require('../../core/component').registerComponent;

module.exports.Component = register('canvas', {

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

    // Prevent overscroll on mobile.
    canvasEl.addEventListener('touchmove', function (event) {
      event.preventDefault();
    });

    // Handle fullscreeen styling
    sceneEl.addEventListener('enter-vr', addFullscreenClass);
    sceneEl.addEventListener('exit-vr', removeFullscreenClass);

    // Set canvas on scene.
    sceneEl.canvas = canvasEl;
    sceneEl.emit('render-target-loaded', {
      target: canvasEl
    });

    function addFullscreenClass (event) {
      canvasEl.classList.add('fullscreen');
    }

    function removeFullscreenClass (event) {
      canvasEl.classList.remove('fullscreen');
    }

    function onFullScreenChange () {
      var fullscreenEl =
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement;
      // No fullscren element === exit fullscreen
      if (!fullscreenEl) { sceneEl.exitVR(); }
      document.activeElement.blur();
      document.body.focus();
      // For unkown reasons a syncrhonous resize does
      // not work on desktop when entering/exiting fullscreen
      setTimeout(bind(sceneEl.resize, sceneEl), 0);
    }
  }

});
