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
    roundCorners: {default: true},
    src: {type: 'map'}
  },

  init: function () {
    var data = this.data;
    var borderRadius = data.roundCorners ? 0.05 : 0.01;
    var geometry = this.geometry = SPATIAL.utils.generatePlaneGeometryIndexed(data.width, data.height, borderRadius, 22);
    var material = this.material = new THREE.MeshPhysicalMaterial({
      roughness: 0.6,
      transmission: 1,
      transparent: true,
      color: new THREE.Color(data.color)
    });

    this.plane = new THREE.Mesh(geometry, material);
    this.el.setObject3D('mesh', this.plane);
  },

  update: function () {
    this.material.color.set(this.data.color);
  }
});
