var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

module.exports.Component = registerComponent('collada-model', {
  schema: {type: 'asset'},

  init: function () {
    this.model = null;
    this.loader = new THREE.ColladaLoader();
  },

  update: function () {
    var self = this;
    var el = this.el;
    var src = this.data;
    var rendererSystem = this.el.sceneEl.systems.renderer;

    if (!src) { return; }

    this.remove();

    this.loader.load(src, function (colladaModel) {
      self.model = colladaModel.scene;
      self.model.traverse(function (object) {
        if (object.isMesh) {
          var material = object.material;
          if (material.color) rendererSystem.applyColorCorrection(material.color);
          if (material.map) rendererSystem.applyColorCorrection(material.map);
          if (material.emissive) rendererSystem.applyColorCorrection(material.emissive);
          if (material.emissiveMap) rendererSystem.applyColorCorrection(material.emissiveMap);
        }
      });
      el.setObject3D('mesh', self.model);
      el.emit('model-loaded', {format: 'collada', model: self.model});
    });
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  }
});
