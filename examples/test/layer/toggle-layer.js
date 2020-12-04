/* global AFRAME */
AFRAME.registerComponent('toggle-layer', {
  init: function () {
    var layerEl = document.querySelector('[layer]');
    this.el.addEventListener('thumbstickdown', function () {
      layerEl.components.layer.toggleCompositorLayer();
    });
  }
});
