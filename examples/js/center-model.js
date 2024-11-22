/* global AFRAME, THREE */
AFRAME.registerComponent('center-model', {
  init: function () {
    var model;
    this.onModelLoaded = this.onModelLoaded.bind(this);
    model = this.el.components['gltf-model'] && this.el.components['gltf-model'].model;
    if (model) {
      this.centerModel(model);
      return;
    }
    document.addEventListener('model-loaded', this.onModelLoaded);
  },

  onModelLoaded: function () {
    var model = this.el.components['gltf-model'].model;
    this.centerModel(model);
  },

  centerModel: function (model) {
    var box;
    var center;
    this.el.removeObject3D('mesh');
    box = new THREE.Box3().setFromObject(model);
    center = box.getCenter(new THREE.Vector3());
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);
    this.el.setObject3D('mesh', model);
  }
});
