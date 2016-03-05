var isIframed = require('../../utils/').isIframed;

/**
 * Register fullscreen listener to scene.
 */
module.exports = function initFullscreenListener (scene) {
  var handler = fullscreenChangeHandler.bind(scene);
  document.addEventListener('mozfullscreenchange', handler);
  document.addEventListener('webkitfullscreenchange', handler);

  // Handles fullscreen behavior when inside an iframe.
  if (!isIframed()) { return; }
  window.addEventListener('message', iframedFullscreenChangeHandler.bind(scene));
};

function fullscreenChangeHandler (event) {
  var fullscreenElement = document.fullscreenElement ||
                          document.mozFullScreenElement ||
                          document.webkitFullscreenElement;
  var scene = this;

  // Lock to landscape orientation on mobile.
  if (scene.isMobile && window.screen.orientation) {
    if (fullscreenElement) {
      window.screen.orientation.lock('landscape');
    } else {
      window.screen.orientation.unlock();
    }
  }

  if (fullscreenElement) {
    enterFullscreenHandler(scene);
  } else {
    exitFullscreenHandler(scene);
  }
}

function iframedFullscreenChangeHandler (event) {
  var scene = this;
  if (!event.data) { return; }

  switch (event.data.type) {
    case 'fullscreen': {
      switch (event.data.data) {
        case 'enter':
          enterFullscreenHandler(scene);
          break;
        case 'exit':
          exitFullscreenHandler(scene);
          break;
      }
    }
  }
}

function enterFullscreenHandler (scene) {
  scene.addState('fullscreen');
  scene.emit('fullscreen-enter');
}

function exitFullscreenHandler (scene) {
  scene.removeState('fullscreen');
  scene.emit('fullscreen-exit');
}
