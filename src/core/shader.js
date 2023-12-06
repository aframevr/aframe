var schema = require('./schema');

var processSchema = schema.process;
var shaders = module.exports.shaders = {};  // Keep track of registered shaders.
var shaderNames = module.exports.shaderNames = [];  // Keep track of the names of registered shaders.
var THREE = require('../lib/three');
var utils = require('../utils');

// A-Frame properties to three.js uniform types.
var propertyToThreeMapping = {
  array: 'v3',
  color: 'v3',
  int: 'i',
  number: 'f',
  map: 't',
  time: 'f',
  vec2: 'v2',
  vec3: 'v3',
  vec4: 'v4'
};

/**
 * Shader class definition.
 *
 * Shaders extend the material component API so you can create your own library
 * of customized materials.
 *
 */
var Shader = module.exports.Shader = function () {};

Shader.prototype = {
  /**
   * Contains the type schema and defaults for the data values.
   * Data is coerced into the types of the values of the defaults.
   */
  schema: {},

  vertexShader:
    'void main() {' +
      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);' +
    '}',

  fragmentShader:
    'void main() {' +
      'gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);' +
    '}',

  /**
   * Init handler. Similar to attachedCallback.
   * Called during shader initialization and is only run once.
   */
  init: function (data) {
    this.attributes = this.initVariables(data, 'attribute');
    this.uniforms = this.initVariables(data, 'uniform');
    this.material = new (this.raw ? THREE.RawShaderMaterial : THREE.ShaderMaterial)({
      // attributes: this.attributes,
      uniforms: this.uniforms,
      glslVersion: this.raw || this.glsl3 ? THREE.GLSL3 : null,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader
    });
    return this.material;
  },

  initVariables: function (data, type) {
    var key;
    var schema = this.schema;
    var variables = {};
    var varType;

    for (key in schema) {
      if (schema[key].is !== type) { continue; }
      varType = propertyToThreeMapping[schema[key].type];
      variables[key] = {
        type: varType,
        value: undefined  // Let updateVariables handle setting these.
      };
    }
    return variables;
  },

  /**
   * Update handler. Similar to attributeChangedCallback.
   * Called whenever the associated material data changes.
   *
   * @param {object} data - New material data.
   */
  update: function (data) {
    this.updateVariables(data, 'attribute');
    this.updateVariables(data, 'uniform');
  },

  updateVariables: function (data, type) {
    var key;
    var materialKey;
    var schema = this.schema;
    var variables;

    variables = type === 'uniform' ? this.uniforms : this.attributes;
    for (key in data) {
      if (!schema[key] || schema[key].is !== type) { continue; }

      if (schema[key].type === 'map') {
        // If data unchanged, get out early.
        if (!variables[key] || variables[key].value === data[key]) { continue; }

        // Special handling is needed for textures.
        materialKey = '_texture_' + key;

        // We can't actually set the variable correctly until we've loaded the texture.
        this.setMapOnTextureLoad(variables, key, materialKey);

        // Kick off the texture update now that handler is added.
        utils.material.updateMapMaterialFromData(materialKey, key, this, data);
        continue;
      }
      variables[key].value = this.parseValue(schema[key].type, data[key]);
      variables[key].needsUpdate = true;
    }
  },

  parseValue: function (type, value) {
    var color;
    switch (type) {
      case 'vec2': {
        return new THREE.Vector2(value.x, value.y);
      }
      case 'vec3': {
        return new THREE.Vector3(value.x, value.y, value.z);
      }
      case 'vec4': {
        return new THREE.Vector4(value.x, value.y, value.z, value.w);
      }
      case 'color': {
        color = new THREE.Color(value);
        return new THREE.Vector3(color.r, color.g, color.b);
      }
      case 'map': {
        return THREE.ImageUtils.loadTexture(value);
      }
      default: {
        return value;
      }
    }
  },

  setMapOnTextureLoad: function (variables, key, materialKey) {
    var self = this;
    this.el.addEventListener('materialtextureloaded', function () {
      variables[key].value = self.material[materialKey];
      variables[key].needsUpdate = true;
    });
  }
};

/**
 * Registers a shader to A-Frame.
 *
 * @param {string} name - shader name.
 * @param {object} definition - shader property and methods.
 * @returns {object} Shader.
 */
module.exports.registerShader = function (name, definition) {
  var NewShader;
  var proto = {};

  // Format definition object to prototype object.
  Object.keys(definition).forEach(function (key) {
    proto[key] = {
      value: definition[key],
      writable: true
    };
  });

  if (shaders[name]) {
    throw new Error('The shader ' + name + ' has been already registered');
  }
  NewShader = function () { Shader.call(this); };
  NewShader.prototype = Object.create(Shader.prototype, proto);
  NewShader.prototype.name = name;
  NewShader.prototype.constructor = NewShader;
  shaders[name] = {
    Shader: NewShader,
    schema: processSchema(NewShader.prototype.schema)
  };
  shaderNames.push(name);
  return NewShader;
};
