/* global AFRAME, THREE */

/**
 * Loads and setup ground model.
 */
AFRAME.registerComponent('ground', {
  init: function () {
    this.onModelLoaded = this.onModelLoaded.bind(this);
    this.el.addEventListener('model-loaded', this.onModelLoaded);
    this.el.setAttribute('gltf-model', '#ground');
  },
  onModelLoaded: function (evt) {
    var model = evt.detail.model;
    model.children.forEach(function (value) {
      value.receiveShadow = true;
      value.material.flatShading = THREE.FlatShading;
    });
  }
});
