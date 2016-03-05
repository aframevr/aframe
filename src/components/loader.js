var debug = require('../utils/debug');
var registerComponent = require('../core/component').registerComponent;
var parseUrl = require('../utils/src-loader').parseUrl;
var THREE = require('../lib/three');

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

  init: function () {
    warn('loader component is deprecated. Use collada-model or obj-model component instead.');
  },

  update: function () {
    var el = this.el;
    var data = this.data;
    var model = this.model;
    var url = parseUrl(data.src);
    var format = data.format;
    if (model) { el.removeObject3D('mesh'); }
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

  loadObj: function (objUrl) {
    var el = this.el;
    var objLoader = new THREE.OBJLoader();
    objLoader.load(objUrl, function (object) {
      this.model = object;
      this.applyMaterial();
      el.setObject3D('mesh', object);
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
      el.setObject3D('mesh', collada.scene);
    });
  }
});
