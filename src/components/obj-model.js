var debug = require('../utils/debug');
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

var objLoader = new THREE.OBJLoader();
var mtlLoader = new THREE.MTLLoader(objLoader.manager);
var warn = debug('components:obj-model:warn');

module.exports.Component = registerComponent('obj-model', {
  dependencies: [ 'material' ],

  schema: {
    mtl: { type: 'src' },
    obj: { type: 'src' }
  },

  init: function () {
    this.model = null;
  },

  update: function () {
    var data = this.data;
    if (!data.obj) { return; }
    this.remove();
    this.loadObj(data.obj, data.mtl);
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  },

  loadObj: function (objUrl, mtlUrl) {
    var self = this;
    var el = this.el;

    if (mtlUrl) {
      // .OBJ with an .MTL.
      if (el.hasAttribute('material')) {
        warn('Material component properties are ignored when a .MTL is provided');
      }
      mtlLoader.setBaseUrl(mtlUrl.substr(0, mtlUrl.lastIndexOf('/') + 1));
      mtlLoader.load(mtlUrl, function (materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load(objUrl, function (object) {
          self.model = object;
          el.setObject3D('mesh', object);
        });
      });
      return;
    }

    // .OBJ only.
    objLoader.load(objUrl, function (objModel) {
      // Apply material.
      var material = this.el.components.material.material;
      objModel.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = material;
        }
      });

      self.model = objModel;
      el.setObject3D('mesh', self.model);
    });
  }
});
