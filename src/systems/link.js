var registerSystem = require('../core/system').registerSystem;

/**
 * Tracked controls system.
 * It maintains a list with the available tracked controllers
 */
module.exports.System = registerSystem('link', {
  init: function () {
    var sceneEl = this.el.sceneEl;
    // Enter VR on `vrdisplayactivate` (e.g. putting on Rift headset).
    window.addEventListener('vrdisplayactivate', function () { sceneEl.enterVR(); });

    // Exit VR on `vrdisplaydeactivate` (e.g. taking off Rift headset).
    window.addEventListener('vrdisplaydeactivate', function () { sceneEl.exitVR(); });
  }
});
