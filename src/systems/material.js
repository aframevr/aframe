var registerSystem = require('../core/system').registerSystem;
var shaders = require('../core/shader').shaders;
var THREE = require('../lib/three');

/**
 * System for material component.
 * Handle material creation, material updates.
 */
module.exports.System = registerSystem('material', {
  init: function () {
    this.shaders = [];
  },

  /**
   * Create and register material.
   */
  createShader: function (el, data) {
    var shader = createShader(el, data);
    this.shaders.push(shader);
    return shader;
  },

  updateShader: function (shader, data) {
    shader.update(data);
  },

  /**
   * Create and register material.
   */
  unuseShader: function (shader) {
    var shaders = this.shaders;
    var index = shaders.indexOf(shader);
    shader.material.dispose();
    shaders.splice(index, 1);
  },

  /**
   * Trigger update to all materials.
   */
  needsUpdate: function () {
    Object.keys(this.shaders).forEach(function setNeedsUpdate (key) {
      shaders[key].material.needsUpdate = true;
    });
  }
});

/**
 * Create geometry using component data.
 *
 * @param {object} data - Component data.
 * @returns {object} Geometry.
 */
function createShader (el, data) {
  var shaderInstance;
  var shaderName = data.shader;
  var ShaderClass = shaders[shaderName] && shaders[shaderName].Shader;

  if (!ShaderClass) { throw new Error('Unknown shader `' + shaderName + '`'); }

  shaderInstance = new ShaderClass(el);
  shaderInstance.init(data);
  updateBaseMaterial(shaderInstance.material, data);
  return shaderInstance;
}

/**
 * Update base material properties that are present among all types of materials.
 *
 * @param {object} material
 * @param {object} data
 */
function updateBaseMaterial (material, data) {
  material.side = parseSide(data.side);
  material.opacity = data.opacity;
  material.transparent = data.transparent !== false || data.opacity < 1.0;
  material.depthTest = data.depthTest !== false;
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
