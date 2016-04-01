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
var TYPE_TIME = 'time';

/**
 * Material component.
 *
 * @member {object} shader - Determines how material is shaded. Defaults to `standard`,
 *         three.js's implementation of PBR. Another standard shading model is `flat` which
 *         uses MeshBasicMaterial.
 */
module.exports.Component = registerComponent('material', {
  schema: {
    shader: { default: 'standard', oneOf: shaderNames },
    transparent: { default: false },
    opacity: { default: 1.0, min: 0.0, max: 1.0 },
    side: { default: 'front', oneOf: ['front', 'back', 'double'] },
    depthTest: { default: true }
  },

  /**
   * Init handler that can be overridden to provide a custom three.js material.
   */
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
    this.shader.update(data);
    updateBaseMaterial(this.material, data);
  },

  /**
   * Update schema (handler) based on `shader` property, if necessary.
   */
  updateSchema: function (data) {
    var newShader = data.shader;
    var currentShader = this.data && this.data.shader;
    var shader = newShader || currentShader;
    var schema = shaders[shader] && shaders[shader].schema;
    if (!schema) { error('Unknown shader schema ' + shader); }
    if (currentShader && newShader === currentShader) { return; }
    this.extendSchema(schema);
    this.updateTick();
  },

  /**
   * Update tick handler that continuously updates certain shader uniforms if the shader
   * specifies certain uniform types like `time`.
   */
  updateTick: function () {
    var needsTick = false;
    var scene = this.el.sceneEl;
    var schema = this.schema;
    var self = this;
    var tickProperties = {};  // Map of property name to property value.
    var tickPropertiesTypes = {};  // Map of property name to property type.

    // Tick function that updates shader uniforms.
    function tick (time, timeDelta) {
      Object.keys(tickPropertiesTypes).forEach(function updateShader (key) {
        if (tickPropertiesTypes[key] !== TYPE_TIME) { return; }
        tickProperties[key] = time;
      });
      self.shader.update(tickProperties);
    }

    // Determine whether tick is needed.
    Object.keys(schema).forEach(function markTickProperties (key) {
      if (schema[key].type !== TYPE_TIME) { return; }
      tickPropertiesTypes[key] = schema[key].type;  // Mark as needing to pass into shader.
      needsTick = true;
    });

    // Add tick if needed.
    if (needsTick) {
      self.tick = tick;
      scene.addBehavior(this);
      return;
    }
    // Remove tick if no longer needed.
    self.tick = null;
    scene.removeBehavior(this);
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
   * @param {object} data - Material component data.
   * @param {object} type - Material type to create.
   * @returns {object} Material.
   */
  setMaterial: function (material) {
    var mesh = this.el.getOrCreateObject3D('mesh', THREE.Mesh);
    var system = this.system;
    if (this.material) { disposeMaterial(this.material, system); }
    this.material = mesh.material = material;
    system.registerMaterial(material);
  }
});

/**
 * Update material base properties.
 *
 * @param material {object} - three.js material.
 * @param data {object} - Component data.
 */
function updateBaseMaterial (material, data) {
  material.depthTest = data.depthTest;
  material.side = parseSide(data.side);
  material.opacity = data.opacity;
  material.transparent = data.transparent !== false || data.opacity < 1.0;
}

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

/**
 * Dispose of material from memory and unsubscribe material from scene updates like fog.
 */
function disposeMaterial (material, system) {
  material.dispose();
  system.unregisterMaterial(material);
}
