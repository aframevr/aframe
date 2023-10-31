/* global AFRAME, THREE, SPATIAL */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Spatial Window component for A-Frame.
 */
AFRAME.registerComponent('spatial-hero-image', {
  schema: {
    color: {type: 'color', default: '#fff'},
    width: {default: 1, min: 0},
    height: {default: 1, min: 0},
    focused: {default: true},
    roundCorners: {default: true},
    src: {type: 'map'}
  },

  init: function () {
    var data = this.data;
    var borderRadius = data.roundCorners ? 0.05 : 0.01;
    var geometry = this.geometry = SPATIAL.utils.generatePlaneGeometryIndexed(data.width, data.height, borderRadius, 22);
    var material = this.material = new THREE.MeshBasicMaterial({color: new THREE.Color(data.color)});
    this.el.sceneEl.systems.material.loadTexture(data.src, {src: data.src}, function textureLoaded (texture) {
      material.map = texture;
      texture.colorSpace = THREE.SRGBColorSpace;
    });
    this.plane = new THREE.Mesh(geometry, material);
    this.el.setObject3D('mesh', this.plane);
  }
});
