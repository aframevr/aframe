var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

var loader = new THREE.ColladaLoader();
loader.options.convertUpAxis = true;

module.exports.Component = registerComponent('collada-model', {
  schema: {
    type: 'src'
  },

  init: function () {
    this.model = null;
  },

  update: function () {
    var self = this;
    var el = this.el;
    var src = this.data;

    if (!src) { return; }

    this.remove();

    loader.load(src, function (colladaModel) {
      self.model = colladaModel.scene;
      el.setObject3D('mesh', self.model);
      el.emit('model-loaded', {format: 'collada', model: self.model});
    });
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  }
});
