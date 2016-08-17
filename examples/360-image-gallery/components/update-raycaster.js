/* global AFRAME */
AFRAME.registerComponent('update-raycaster', {
  schema: {type: 'selector'},

  init: function () {
    var raycasterEl = this.data;
    raycasterEl.components.raycaster.refreshObjects();
  }
});
