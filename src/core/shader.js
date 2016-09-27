var schema = require('./schema');

var processSchema = schema.process;
var shaders = module.exports.shaders = {};  // Keep track of registered shaders.
var shaderNames = module.exports.shaderNames = [];  // Keep track of the names of registered shaders.
var THREE = require('../lib/three');

var propertyToThreeMapping = {
  number: 'f',
  time: 'f',
  vec4: 'v4',
  vec3: 'v3',
  vec2: 'v2',
  color: 'v3'
};

/**
 * Shader class definition.
 *
 * Shaders extend the material component API so you can create your own library
 * of customized materials
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
      'gl_FragColor = vec4(1.0,0.0,1.0,1.0);' +
    '}',

  /**
   * Init handler. Similar to attachedCallback.
   * Called during shader initialization and is only run once.
   */
  init: function (data) {
    this.attributes = this.initVariables(data, 'attribute');
    this.uniforms = this.initVariables(data, 'uniform');
    this.material = new THREE.ShaderMaterial({
      // attributes: this.attributes,
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader
    });
    return this.material;
  },

  initVariables: function (data, type) {
    var self = this;
    var variables = {};
    var schema = this.schema;
    var schemaKeys = Object.keys(schema);
    schemaKeys.forEach(processSchema);
    function processSchema (key) {
      if (schema[key].is !== type) { return; }
      var varType = propertyToThreeMapping[schema[key].type];
      var varValue = schema[key].parse(data[key] || schema[key].default);
      variables[key] = {
        type: varType,
        value: self.parseValue(schema[key].type, varValue)
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
    var self = this;
    var variables = type === 'uniform' ? this.uniforms : this.attributes;
    var dataKeys = Object.keys(data);
    var schema = this.schema;
    dataKeys.forEach(processData);
    function processData (key) {
      if (!schema[key] || schema[key].is !== type) { return; }
      if (variables[key].value === data[key]) { return; }
      variables[key].value = self.parseValue(schema[key].type, data[key]);
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
      default: {
        return value;
      }
    }
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
