/* global AFRAME THREE */

AFRAME.registerComponent('envmap', {
  dependencies: ['material'],

  update: function () {
    this.el.envEl = document.querySelector('a-videosphere');
  },

  tick: function () {
    var et = this.el.envEl.object3DMap.mesh.material.map;
    et.mapping = THREE.EquirectangularReflectionMapping;
    this.el.object3DMap.mesh.material.map = et;
  }
});
