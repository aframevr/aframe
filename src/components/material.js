import * as THREE from 'three';
import * as utils from '../utils/index.js';
import { registerComponent } from '../core/component.js';
import { shaders, shaderNames } from '../core/shader.js';

var error = utils.debug('components:material:error');
var disposeMaterial = utils.material.disposeMaterial;

/**
 * Material component.
 *
 * @member {object} shader - Determines how material is shaded. Defaults to `standard`,
 *         three.js's implementation of PBR. Another standard shading model is `flat` which
 *         uses MeshBasicMaterial.
 */
export var Component = registerComponent('material', {
  schema: {
    alphaTest: {default: 0.0, min: 0.0, max: 1.0},
    depthTest: {default: true},
    depthWrite: {default: true},
    flatShading: {default: false},
    offset: {type: 'vec2', default: {x: 0, y: 0}},
    opacity: {default: 1.0, min: 0.0, max: 1.0},
    premultipliedAlpha: {default: false},
    repeat: {type: 'vec2', default: {x: 1, y: 1}},
    magFilter: {default: 'linear', oneOf: ['nearest', 'linear']},
    minFilter: {
      default: 'linear-mipmap-linear',
      oneOf: ['nearest', 'nearest-mipmap-nearest', 'nearest-mipmap-linear', 'linear', 'linear-mipmap-nearest', 'linear-mipmap-linear']
    },
    shader: {default: 'standard', oneOf: shaderNames, schemaChange: true},
    side: {default: 'front', oneOf: ['front', 'back', 'double']},
    transparent: {default: false},
    vertexColorsEnabled: {default: false},
    visible: {default: true},
    blending: {default: 'normal', oneOf: ['none', 'normal', 'additive', 'subtractive', 'multiply']},
    dithering: {default: true},
    anisotropy: {default: 0, min: 0}
  },

  init: function () {
    this.material = null;
  },

  /**
   * Update or create material.
   *
   * @param {object|null} oldData
   */
  update: function (oldData) {
    var data = this.data;
    if (!this.shader || data.shader !== oldData.shader) {
      this.updateShader(data.shader);
    }
    this.shader.update(this.data);
    this.updateMaterial(oldData);
  },

  updateSchema: function (data) {
    var currentShader;
    var newShader;
    var schema;
    var shader;

    newShader = data && data.shader;
    currentShader = this.oldData && this.oldData.shader;
    shader = newShader || currentShader;
    schema = shaders[shader] && shaders[shader].schema;

    if (!schema) { error('Unknown shader schema ' + shader); }
    if (currentShader && newShader === currentShader) { return; }
    this.extendSchema(schema);
    this.updateBehavior();
  },

  updateBehavior: function () {
    var key;
    var sceneEl = this.el.sceneEl;
    var schema = this.schema;
    var self = this;
    var tickProperties;

    function tickTime (time, delta) {
      var key;
      for (key in tickProperties) {
        tickProperties[key] = time;
      }
      self.shader.update(tickProperties);
    }

    this.tick = undefined;

    tickProperties = {};
    for (key in schema) {
      if (schema[key].type === 'time') {
        this.tick = tickTime;
        tickProperties[key] = true;
      }
    }

    if (!sceneEl) { return; }
    if (this.tick) {
      sceneEl.addBehavior(this);
    } else {
      sceneEl.removeBehavior(this);
    }
  },

  updateShader: function (shaderName) {
    var data = this.data;
    var Shader = shaders[shaderName] && shaders[shaderName].Shader;
    var shaderInstance;

    if (!Shader) { throw new Error('Unknown shader ' + shaderName); }

    // Get material from A-Frame shader.
    shaderInstance = this.shader = new Shader();
    shaderInstance.el = this.el;
    shaderInstance.init(data);
    this.setMaterial(shaderInstance.material);
    this.updateSchema(data);
  },

  /**
   * Set and update base material properties.
   * Set `needsUpdate` when needed.
   */
  updateMaterial: function (oldData) {
    var data = this.data;
    var material = this.material;
    var oldDataHasKeys;

    // Base material properties.
    utils.material.updateBaseMaterial(material, data);

    // Check if material needs update.
    for (oldDataHasKeys in oldData) { break; }
    if (oldDataHasKeys &&
        (oldData.alphaTest !== data.alphaTest ||
         oldData.side !== data.side ||
         oldData.vertexColorsEnabled !== data.vertexColorsEnabled)) {
      material.needsUpdate = true;
    }
  },

  /**
   * Remove material on remove (callback).
   * Dispose of it from memory and unsubscribe from scene updates.
   */
  remove: function () {
    var defaultMaterial = new THREE.MeshBasicMaterial();
    var material = this.material;
    var object3D = this.el.getObject3D('mesh');
    if (object3D) { object3D.material = defaultMaterial; }
    disposeMaterial(material, this.system);
  },

  /**
   * (Re)create new material. Has side-effects of setting `this.material` and updating
   * material registration in scene.
   *
   * @param {THREE.Material} material - Material to register.
   */
  setMaterial: function (material) {
    var el = this.el;
    var mesh;
    var system = this.system;

    if (this.material) { disposeMaterial(this.material, system); }

    this.material = material;
    system.registerMaterial(material);

    // Set on mesh. If mesh does not exist, wait for it.
    mesh = el.getObject3D('mesh');
    if (mesh) {
      mesh.material = material;
    } else {
      el.addEventListener('object3dset', function waitForMesh (evt) {
        if (evt.detail.type !== 'mesh' || evt.target !== el) { return; }
        el.getObject3D('mesh').material = material;
        el.removeEventListener('object3dset', waitForMesh);
      });
    }
  }
});
