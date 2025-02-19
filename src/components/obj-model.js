import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { debug } from '../utils/index.js';
import { registerComponent } from '../core/component.js';

var warn = debug('components:obj-model:warn');

export var Component = registerComponent('obj-model', {
  schema: {
    mtl: {type: 'model'},
    obj: {type: 'model'}
  },

  init: function () {
    var self = this;

    this.model = null;
    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader(this.objLoader.manager);
    // Allow cross-origin images to be loaded.
    this.mtlLoader.crossOrigin = '';

    this.el.addEventListener('componentinitialized', function (evt) {
      if (!self.model) { return; }
      if (evt.detail.name !== 'material') { return; }
      self.applyMaterial();
    });
  },

  update: function () {
    var data = this.data;
    if (!data.obj) { return; }
    this.resetMesh();
    this.loadObj(data.obj, data.mtl);
  },

  remove: function () {
    this.resetMesh();
  },

  resetMesh: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  },

  loadObj: function (objUrl, mtlUrl) {
    var self = this;
    var el = this.el;
    var mtlLoader = this.mtlLoader;
    var objLoader = this.objLoader;
    var rendererSystem = this.el.sceneEl.systems.renderer;
    var BASE_PATH = mtlUrl.substr(0, mtlUrl.lastIndexOf('/') + 1);

    if (mtlUrl) {
      // .OBJ with an .MTL.
      if (el.hasAttribute('material')) {
        warn('Material component properties are ignored when a .MTL is provided');
      }
      mtlLoader.setResourcePath(BASE_PATH);
      mtlLoader.load(mtlUrl, function (materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load(objUrl, function (objModel) {
          self.model = objModel;
          self.model.traverse(function (object) {
            if (object.isMesh) {
              var material = object.material;
              if (material.map) rendererSystem.applyColorCorrection(material.map);
              if (material.emissiveMap) rendererSystem.applyColorCorrection(material.emissiveMap);
            }
          });
          el.setObject3D('mesh', objModel);
          el.emit('model-loaded', {format: 'obj', model: objModel});
        });
      });
      return;
    }

    // .OBJ only.
    objLoader.load(objUrl, function loadObjOnly (objModel) {
      self.model = objModel;
      self.applyMaterial();
      el.setObject3D('mesh', objModel);
      el.emit('model-loaded', {format: 'obj', model: objModel});
    });
  },

  /**
   * Apply material from material component recursively.
   */
  applyMaterial: function () {
    var material = this.el.components.material;
    if (!material) { return; }
    this.model.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = material.material;
      }
    });
  }
});
