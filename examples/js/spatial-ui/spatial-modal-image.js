/* global AFRAME, THREE, SPATIAL */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Spatial Window component for A-Frame.
 */
AFRAME.registerComponent('spatial-modal-image', {
  schema: {
    color: {type: 'color', default: '#fff'},
    width: {default: 1, min: 0},
    height: {default: 1, min: 0},
    src: {type: 'map', default: 'https://cdn.aframe.io/examples/ui/kazetachinu.jpg'}
  },

  init: function () {
    var data = this.data;
    var geometry = this.geometry = SPATIAL.utils.generatePlaneGeometryTwoCorners(data.width, data.height, 0.05, 22);
    var material = this.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(data.color) });

    this.plane = new THREE.Mesh(geometry, material);
    this.el.setObject3D('mesh', this.plane);
  },

  update: function (oldData) {
    var data = this.data;
    var material = this.material;

    if (data.src !== oldData.src) {
      var texture = new THREE.TextureLoader().load(data.src, function () {
        // material.needsUpdate = true;
      });
      material.map = texture;
      material.needsUpdate = true;
      texture.colorSpace = THREE.SRGBColorSpace;
    }
  }
});
