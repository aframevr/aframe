var bind = require('../../utils/bind');
var isIframed = require('../../utils/').isIframed;

/**
 * Provides a post message API for scenes contained
 * in an iframe.
 */
module.exports = function initPostMessageAPI (scene) {
  // Handles fullscreen behavior when inside an iframe.
  if (!isIframed()) { return; }
  // postMessage API handler
  window.addEventListener('message', bind(postMessageAPIHandler, scene));
};

function postMessageAPIHandler (event) {
  var scene = this;
  if (!event.data) { return; }

  switch (event.data.type) {
    case 'vr': {
      switch (event.data.data) {
        case 'enter':
          scene.enterVR();
          break;
        case 'exit':
          scene.exitVR();
          break;
      }
    }
  }
}
