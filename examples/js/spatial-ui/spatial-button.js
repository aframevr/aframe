/* global AFRAME, THREE, SPATIAL */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Spatial Window component for A-Frame.
 */
AFRAME.registerComponent('spatial-button', {
  schema: {
    color: {type: 'color', default: '#60ff7e'},
    width: {default: 0.35, min: 0},
    height: {default: 0.08, min: 0},
    focused: {default: true},
    text: {default: 'start'}
  },

  init: function () {
    var data = this.data;
    var geometry = this.geometry = SPATIAL.utils.generatePlaneGeometryIndexed(data.width, data.height, 0.035, 22);
    var material = this.material = new THREE.MeshPhysicalMaterial({
      roughness: 0.6,
      transmission: 1,
      color: new THREE.Color(data.color)
    });

    var textEl = this.textEl = document.createElement('a-entity');
    textEl.setAttribute('text', {
      value: this.data.text,
      width: 0.75,
      align: 'center',
      font: 'kelsonsans'
    });
    textEl.setAttribute('position', '0 0 0.005');

    this.el.appendChild(textEl);
    this.plane = new THREE.Mesh(geometry, material);
    this.el.setObject3D('mesh', this.plane);

    this.el.addEventListener('mouseenter', function () { material.roughness = 0.9; });
    this.el.addEventListener('mouseleave', function () { material.roughness = 0.8; });
  }
});
