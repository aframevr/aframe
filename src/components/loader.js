var debug = require('../utils/debug');
var registerComponent = require('../core/component').registerComponent;
var parseUrl = require('../utils/src-loader').parseUrl;
var THREE = require('../../lib/three');

var warn = debug('components:loader:warn');

module.exports.Component = registerComponent('loader', {
  dependencies: [ 'material' ],

  schema: {
    src: { default: '' },
    format: {
      default: 'obj',
      oneOf: ['obj', 'collada']
    }
  },

  update: function () {
    var el = this.el;
    var data = this.data;
    var model = this.model;
    var url = parseUrl(data.src);
    var format = data.format;
    if (model) { el.object3D.remove(model); }
    if (!url) {
      warn('Model URL not provided');
      return;
    }
    switch (format) {
      case 'obj':
        this.loadObj(url);
        break;
      case 'collada':
        this.loadCollada(url);
        break;
      default:
        warn('Model format not supported');
    }
  },

  loadObj: function (url) {
    var self = this;
    var el = this.el;
    var loader = new THREE.OBJLoader();
    loader.load(url, function (object) {
      self.model = object;
      self.applyMaterial();
      el.object3D.add(object);
    });
  },

  applyMaterial: function () {
    var material = this.el.components.material.material;
    if (!this.model) { return; }
    this.model.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });
  },

  loadCollada: function (url) {
    var self = this;
    var el = this.el;
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load(url, function (collada) {
      self.model = collada.scene;
      el.object3D.add(collada.scene);
    });
  }
});
