var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

/**
 * glTF model loader.
 */
module.exports.Component = registerComponent('gltf-model', {
  schema: {type: 'model'},

  init: function () {
    this.model = null;
    this.loader = new THREE.GLTFLoader();
  },

  update: function () {
    var self = this;
    var el = this.el;
    var src = this.data;

    if (!src) { return; }

    this.remove();

    this.loader.load(src, function gltfLoaded (gltfModel) {
      self.model = gltfModel.scene;
      self.system.registerModel(self.model);
      el.setObject3D('mesh', self.model);
      el.emit('model-loaded', {format: 'gltf', model: self.model});
    });
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
    this.system.unregisterModel(this.model);
  }
});
