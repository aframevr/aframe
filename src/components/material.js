/* global Promise */
var debug = require('../utils/debug');
var utils = require('../utils');
var component = require('../core/component');
var THREE = require('../lib/three');
var shader = require('../core/shader');

var error = debug('components:material:error');
var diff = utils.diff;
var registerComponent = component.registerComponent;
var shaders = shader.shaders;
var shaderNames = shader.shaderNames;

/**
 * Material component.
 *
 * @namespace material
 * @param {string} shader - Determines how material is shaded. Defaults to `standard`,
 *         three.js's implementation of PBR. Another option is `flat` where we use
 *         MeshBasicMaterial.
 */
module.exports.Component = registerComponent('material', {
  schema: {
    shader: { default: 'standard', oneOf: shaderNames },
    transparent: { default: false },
    opacity: { default: 1.0, min: 0.0, max: 1.0 },
    side: { default: 'front', oneOf: ['front', 'back', 'double'] }
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
    var dataDiff = oldData ? diff(oldData, data) : data;

    if (!this.shader || dataDiff.shader) {
      this.updateShader(data.shader);
    }
    this.shader.update(this.data);
    this.updateMaterial();
  },

  updateSchema: function (data) {
    var newShader = data.shader;
    var currentShader = this.data && this.data.shader;
    var shader = newShader || currentShader;
    var schema = shaders[shader] && shaders[shader].schema;
    if (!schema) { error('Unknown shader schema ' + shader); }
    if (currentShader && newShader === currentShader) { return; }
    this.extendSchema(schema);
    this.updateBehavior();
  },

  updateBehavior: function () {
    var scene = this.el.sceneEl;
    var schema = this.schema;
    var self = this;
    var tickProperties = {};
    var tick = function (time, delta) {
      var keys = Object.keys(tickProperties);
      keys.forEach(update);
      function update (key) { tickProperties[key] = time; }
      self.shader.update(tickProperties);
    };
    var keys = Object.keys(schema);
    keys.forEach(function (key) {
      if (schema[key].type === 'time') {
        self.tick = tick;
        tickProperties[key] = true;
        scene.addBehavior(self);
      }
    });
    if (Object.keys(tickProperties).length === 0) {
      scene.removeBehavior(this);
    }
  },

  updateShader: function (shaderName) {
    var data = this.data;
    var Shader = shaders[shaderName] && shaders[shaderName].Shader;
    var material;
    if (!Shader) { throw new Error('Unknown shader ' + shaderName); }
    this.shader = new Shader();
    this.shader.el = this.el;
    material = this.shader.init(data);
    this.setMaterial(material);
    this.updateSchema(data);
  },

  updateMaterial: function () {
    var data = this.data;
    var material = this.material;
    material.side = parseSide(data.side);
    material.opacity = data.opacity;
    material.transparent = data.transparent !== false || data.opacity < 1.0;
  },

  /**
   * Remove material on remove (callback).
   */
  remove: function () {
    var el = this.el;
    var defaultMaterial = new THREE.MeshBasicMaterial();
    var object3D = el.getObject3D('mesh');
    if (object3D) { object3D.material = defaultMaterial; }
    el.sceneEl.unregisterMaterial(this.material);
  },

  /**
   * (Re)create new material. Has side-effects of setting `this.material` and updating
   * material registration in scene.
   *
   * @param {object} data - Material component data.
   * @param {object} type - Material type to create.
   * @returns {object} Material.
   */
  setMaterial: function (material) {
    var mesh = this.el.getOrCreateObject3D('mesh', THREE.Mesh);
    var sceneEl = this.el.sceneEl;
    if (this.material) { sceneEl.unregisterMaterial(this.material); }
    this.material = mesh.material = material;
    sceneEl.registerMaterial(material);
  }
});

/**
 * Returns a three.js constant determining which material face sides to render
 * based on the side parameter (passed as a component property).
 *
 * @param {string} [side=front] - `front`, `back`, or `double`.
 * @returns {number} THREE.FrontSide, THREE.BackSide, or THREE.DoubleSide.
 */
function parseSide (side) {
  switch (side) {
    case 'back': {
      return THREE.BackSide;
    }
    case 'double': {
      return THREE.DoubleSide;
    }
    default: {
      // Including case `front`.
      return THREE.FrontSide;
    }
  }
}
