/* global AFRAME, THREE, SPATIAL */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Spatial Window component for A-Frame.
 */
AFRAME.registerComponent('spatial-window', {
  schema: {
    color: {type: 'color', default: '#fff'},
    width: {default: 1, min: 0},
    height: {default: 1, min: 0},
    focused: {default: true}
  },

  init: function () {
    var data = this.data;
    var geometry = this.geometry = SPATIAL.utils.generatePlaneGeometryIndexed(data.width, data.height, 0.05, 22);
    var material = this.material = new THREE.MeshPhysicalMaterial({
      roughness: 0.6,
      transmission: 1,
      color: new THREE.Color(data.color)
    });

    var maskGeometry = this.maskGeometry = SPATIAL.utils.generatePlaneGeometryIndexed(data.width, data.height, 0.05, 22);
    var maskMaterial = this.maskMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.4,
      color: 'black'
    });

    this.plane = new THREE.Mesh(geometry, material);
    this.planeMask = new THREE.Mesh(maskGeometry, maskMaterial);

    this.planeMask.position.setZ(0.011);
    this.planeMask.visible = false;
    this.planeMask.scale.set(0.9896, 0.9922, 0.99);

    this.el.setObject3D('mask', this.planeMask);
    this.el.setObject3D('mesh', this.plane);
  },

  update: function (oldData) {
    if (this.data.focused !== oldData.focused) { this.updateFocus(); }
  },

  updateFocus: function () {
    var focusState = this.data.focused ? 'focused' : 'unfocused';
    this.planeMask.visible = this.data.focused === false;
    this.el.emit(focusState);
  }
});
