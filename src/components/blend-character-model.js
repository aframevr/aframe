var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

/**
 * Blend character model component.
 * Loads a model with skeletal animation blending.
 */
module.exports.Component = registerComponent('blend-character-model', {
  schema: {type: 'src'},

  init: function () {
    this.model = null;
  },

  update: function () {
    var self = this;
    var el = this.el;
    var src = this.data;

    if (!src) { return; }

    this.remove();
    this.model = new THREE.BlendCharacter();

    this.model.load(src, function () {
      el.setObject3D('mesh', self.model);
      el.emit('model-loaded', {format: 'blend', model: self.model});
      self.model.castShadow = true;
      self.model.receiveShadow = true;
      self.model.material.shading = THREE.FlatShading;
      self.model.geometry.computeBoundingBox();
    });
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  }
});
