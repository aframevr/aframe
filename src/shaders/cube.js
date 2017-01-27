var registerShader = require('../core/shader').registerShader;
var THREE = require('../lib/three');
var utils = require('../utils/');

var CubeLoader = new THREE.CubeTextureLoader();
var texturePromises = {};

/**
 * Cubemap shader using THREE.ShaderMaterial.
 */
module.exports.Component = registerShader('cube', {
  schema: {
    src: { default: '' }
  },
  /**
   * Initializes the shader.
   * Adds a reference from the scene to this entity as the camera.
   */
  init: function (data) {
    this.material = new THREE.ShaderMaterial(getMaterialData(data));
    this.updateCubeMap(data);
    return this.material;
  },

  update: function (data) {
    this.updateMaterial(data);
    this.updateCubeMap(data);
    return this.material;
  },

  /**
   * Updating existing material.
   *
   * @param {object} data - Material component data.
   * @returns {object} Material.
   */
  updateMaterial: function (data) {
    var material = this.material;
    data = getMaterialData(data);
    Object.keys(data).forEach(function (key) {
      material[key] = data[key];
    });
  },

  /**
   * Handle texture cubemap. Textures are cached in texturePromises.
   */
  updateCubeMap: function (data) {
    var self = this;
    var material = this.material;
    var cubeMap = data.src;

    // No cubeMap defined or already loading.
    if (!cubeMap || this.isLoadingCubeMap) {
      material.uniforms['tCube'].value = null;
      material.needsUpdate = true;
      return;
    }
    this.isLoadingCubeMap = true;

    // Another material is already loading this texture. Wait on promise.
    if (texturePromises[cubeMap]) {
      texturePromises[cubeMap].then(function (cube) {
        self.isLoadingCubeMap = false;
        material.uniforms['tCube'].value = cube;
        material.needsUpdate = true;
      });
      return;
    }

    // Material is first to load this texture. Load and resolve texture.
    texturePromises[cubeMap] = new Promise(function (resolve) {
      utils.srcLoader.validateCubemapSrc(cubeMap, function loadCubeMap (urls) {
        CubeLoader.load(urls, function (cube) {
          // Texture loaded.
          self.isLoadingCubeMap = false;
          material.uniforms['tCube'].value = cube;
          resolve(cube);
        });
      });
    });
  }
});

/**
 * Builds and normalize material data, normalizing stuff along the way.
 *
 * @param {object} data - Material data.
 * @returns {object} data - Processed material data.
 */
function getMaterialData (data) {
  var cubeShader = THREE.ShaderLib['cube'];
  return {
    fragmentShader: cubeShader.fragmentShader,
    vertexShader: cubeShader.vertexShader,
    uniforms: cubeShader.uniforms,
    depthWrite: false,
    side: THREE.BackSide
  };
}
