var registerComponent = require('../core/register-component').registerComponent;
var parseUrl = require('../utils/src-loader').parseUrl;
var THREE = require('../../lib/three');
var VRUtils = require('../vr-utils');

module.exports.Component = registerComponent('loader', {
  dependencies: {
    value: [ 'material' ]
  },

  update: {
    value: function () {
      this.load();
    }
  },

  load: {
    value: function () {
      var el = this.el;
      var data = this.data;
      var model = this.model;
      var url = parseUrl(data.src);
      var format = data.format;
      if (model) { el.object3D.remove(model); }
      if (!url) {
        VRUtils.warn('Model URL not provided');
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
          VRUtils.warn('Model format not supported');
      }
    }
  },

  loadObj: {
    value: function (url) {
      var self = this;
      var el = this.el;
      var loader = new THREE.OBJLoader();
      loader.load(url, function (object) {
        self.model = object;
        self.applyMaterial();
        el.object3D.add(object);
      });
    }
  },

  applyMaterial: {
    value: function () {
      var material = this.el.components.material.material;
      if (!this.model) { return; }
      this.model.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = material;
        }
      });
    }
  },

  loadCollada: {
    value: function (url) {
      var self = this;
      var el = this.el;
      var loader = new THREE.ColladaLoader();
      loader.options.convertUpAxis = true;
      loader.load(url, function (collada) {
        self.model = collada.scene;
        el.object3D.add(collada.scene);
      });
    }
  }
});
