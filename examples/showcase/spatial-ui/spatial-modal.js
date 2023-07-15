/* global AFRAME, THREE, SPATIAL */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Spatial Window component for A-Frame.
 */
AFRAME.registerComponent('spatial-modal', {
  schema: {
    color: {type: 'color', default: '#fff'},
    width: {default: 1, min: 0},
    height: {default: 1, min: 0},
    src: {type: 'map'}
  },

  init: function () {
    var data = this.data;
    var geometry = this.geometry = SPATIAL.utils.generatePlaneGeometryIndexed(data.width, data.height, 0.05, 22);
    var material = this.material = new THREE.MeshPhysicalMaterial({
      roughness: 0.6,
      transmission: 1,
      transparent: true,
      color: new THREE.Color(data.color)
    });

    this.plane = new THREE.Mesh(geometry, material);
    this.el.setObject3D('mesh', this.plane);
  }
});
