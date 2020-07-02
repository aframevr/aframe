/* global XRWebGLBinding */
var registerSystem = require('../core/system').registerSystem;

/**
 * Layer system.
 *
 */
module.exports.System = registerSystem('layer', {
  init: function () {
    this.initLayer = this.initLayer.bind(this);
    this.el.sceneEl.addEventListener('enter-vr', this.initLayer);
  },

  initLayer: function () {
    var sceneEl = this.sceneEl;
    this.layerWebGLBinding = new XRWebGLBinding(sceneEl.xrSession, sceneEl.renderer.getContext());
    this.sceneEl.emit('layersapiready');
  },

  update: function () {

  }
});
