var registerShader = require('../core/shader').registerShader;
var srcLoader = require('../utils/src-loader');
var THREE = require('../lib/three');
var utils = require('../utils/');

var CubeLoader = new THREE.CubeTextureLoader();
var texturePromises = {};

/**
 * Standard (physically-based) shader using THREE.MeshStandardMaterial.
 */
module.exports.Component = registerShader('standard', {
  schema: {
    color: { default: '#FFF' },
    envMap: { default: '' },
    fog: { default: true },
    height: { default: 256 },
    metalness: { default: 0.0, min: 0.0, max: 1.0 },
    repeat: { default: '' },
    src: { default: '' },
    roughness: { default: 0.5, min: 0.0, max: 1.0 },
    width: { default: 512 }
  },
  /**
   * Initializes the shader.
   * Adds a reference from the scene to this entity as the camera.
   */
  init: function (data) {
    this.material = new THREE.MeshStandardMaterial(getMaterialData(data));
    this.updateTexture(data);
    this.updateEnvMap(data);
    return this.material;
  },

  update: function (data) {
    this.updateMaterial(data);
    this.updateTexture(data);
    this.updateEnvMap(data);
    return this.material;
  },

  /**
   * Update or create material.
   *
   * @param {object|null} oldData
   */
  updateTexture: function (data) {
    var src = data.src;
    var material = this.material;
    if (src) {
      if (src === this.textureSrc) { return; }
      // Texture added or changed.
      this.textureSrc = src;
      srcLoader.validateSrc(src,
        utils.texture.loadImage.bind(this, material, data),
        utils.texture.loadVideo.bind(this, material, data)
      );
    } else {
      // Texture removed.
      utils.texture.updateMaterial(material, null);
    }
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
   * Handle environment cubemap. Textures are cached in texturePromises.
   */
  updateEnvMap: function (data) {
    var self = this;
    var material = this.material;
    var envMap = data.envMap;

    // No envMap defined or already loading.
    if (!envMap || this.isLoadingEnvMap) {
      material.envMap = null;
      material.needsUpdate = true;
      return;
    }
    this.isLoadingEnvMap = true;

    // Another material is already loading this texture. Wait on promise.
    if (texturePromises[envMap]) {
      texturePromises[envMap].then(function (cube) {
        self.isLoadingEnvMap = false;
        material.envMap = cube;
        material.needsUpdate = true;
      });
      return;
    }

    // Material is first to load this texture. Load and resolve texture.
    texturePromises[envMap] = new Promise(function (resolve) {
      srcLoader.validateCubemapSrc(envMap, function loadEnvMap (urls) {
        CubeLoader.load(urls, function (cube) {
          // Texture loaded.
          self.isLoadingEnvMap = false;
          material.envMap = cube;
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
  var materialData = {
    color: new THREE.Color(data.color),
    metalness: data.metalness,
    roughness: data.roughness
  };
  return materialData;
}
