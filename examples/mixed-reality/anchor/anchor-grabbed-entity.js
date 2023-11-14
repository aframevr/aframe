/* global AFRAME */
AFRAME.registerComponent('anchor-grabbed-entity', {
  init: function () {
    this.el.addEventListener('grabstarted', this.deleteAnchor.bind(this));
    this.el.addEventListener('grabended', this.updateAnchor.bind(this));
  },

  updateAnchor: function (evt) {
    var grabbedEl = evt.detail.grabbedEl;
    var anchoredComponent = grabbedEl.components.anchored;
    if (anchoredComponent) {
      anchoredComponent.createAnchor(grabbedEl.object3D.position, grabbedEl.object3D.quaternion);
    }
  },

  deleteAnchor: function (evt) {
    var grabbedEl = evt.detail.grabbedEl;
    var anchoredComponent = grabbedEl.components.anchored;
    if (anchoredComponent) {
      anchoredComponent.deleteAnchor();
    }
  }
});
