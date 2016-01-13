var registerComponent = require('../../core/component').registerComponent;
var isIframed = require('../../utils/').isIframed;

/**
 * Fullscreen listener scene component.
 */
module.exports.Component = registerComponent('fullscreen', {
  init: function () {
    this.handler = this.fullscreenChangeHandler.bind(this);
    document.addEventListener('mozfullscreenchange', this.handler);
    document.addEventListener('webkitfullscreenchange', this.handler);

    // Handles fullscreen behavior when inside an iframe.
    if (isIframed()) {
      window.addEventListener('message', this.iframedFullscreenChangeHandler.bind(this));
    }
  },

  fullscreenChangeHandler: function (event) {
    var fullscreenElement = document.fullscreenElement ||
                            document.mozFullScreenElement ||
                            document.webkitFullscreenElement;

    // Lock to landscape orientation on mobile.
    if (this.el.isMobile && window.screen.orientation) {
      if (fullscreenElement) {
        window.screen.orientation.lock('landscape');
      } else {
        window.screen.orientation.unlock();
      }
    }

    if (fullscreenElement) {
      this.enterFullscreenHandler();
    } else {
      this.exitFullscreenHandler();
    }
  },

  iframedFullscreenChangeHandler: function (event) {
    if (!event.data) { return; }
    switch (event.data.type) {
      case 'fullscreen': {
        switch (event.data.data) {
          case 'enter':
            this.enterFullscreenHandler();
            break;
          case 'exit':
            this.exitFullscreenHandler();
            break;
        }
      }
    }
  },

  enterFullscreenHandler: function () {
    var scene = this.el;
    scene.addState('fullscreen');
    scene.emit('fullscreen-enter');
  },

  exitFullscreenHandler: function () {
    var scene = this.el;
    scene.removeState('fullscreen');
    scene.emit('fullscreen-exit');
  }
});
