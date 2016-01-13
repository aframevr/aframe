/* global MessageChannel */
var registerComponent = require('../../core/component').registerComponent;

/**
 * Miscellaneous ways of entering VR.
 */
module.exports.Component = registerComponent('vr-mode', {
  init: function () {
    var scene = this.el;

    // Keyboard shortcut.
    window.addEventListener('keyup', function (event) {
      if (event.keyCode === 70) {  // f.
        scene.enterVR();
      }
    }, false);
  },

  /**
   * Checks for VR mode before kicking off render loop.
   */
  checkIFrameVRMode: function () {
    var self = this;

    if (window.top !== window.self) { return; }

    if (this.insideIframe) {
      vrLoaderMode().then(function (isVr) {
        if (isVr) {
          self.enterVR();
        } else {
          self.exitVR();
        }
        window.top.postMessage({type: 'ready'}, '*');
      });
    }
  }
});

/**
 * @returns {object} Promise that resolves a boolean whether loader is in VR mode.
 */
function vrLoaderMode () {
  return new Promise(function (resolve) {
    var channel = new MessageChannel();
    window.top.postMessage({type: 'checkVr'}, '*', [channel.port2]);
    channel.port1.onmessage = function (message) {
      resolve(!!message.data.data.isVr);
    };
  });
}
