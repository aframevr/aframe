var registerShader = require('../core/shader').registerShader;
var THREE = require('../lib/three');
var utils = require('../utils/');

var CubeLoader = new THREE.CubeTextureLoader();
var texturePromises = {};

/**
 * Standard (physically-based) shader using THREE.MeshStandardMaterial.
 */
module.exports.Shader = registerShader('standard', {
  schema: {
    ambientOcclusionMap: {type: 'map'},
    ambientOcclusionMapIntensity: {default: 1},
    ambientOcclusionTextureOffset: {type: 'vec2'},
    ambientOcclusionTextureRepeat: {type: 'vec2', default: {x: 1, y: 1}},

    color: {type: 'color'},

    displacementMap: {type: 'map'},
    displacementScale: {default: 1},
    displacementBias: {default: 0.5},
    displacementTextureOffset: {type: 'vec2'},
    displacementTextureRepeat: {type: 'vec2', default: {x: 1, y: 1}},
    envMap: {default: ''},

    fog: {default: true},
    height: {default: 256},
    metalness: {default: 0.0, min: 0.0, max: 1.0},

    normalMap: {type: 'map'},
    normalScale: {type: 'vec2', default: {x: 1, y: 1}},
    normalTextureOffset: {type: 'vec2'},
    normalTextureRepeat: {type: 'vec2', default: {x: 1, y: 1}},

    offset: {type: 'vec2', default: {x: 0, y: 0}},
    repeat: {type: 'vec2', default: {x: 1, y: 1}},
    roughness: {default: 0.5, min: 0.0, max: 1.0},
    sphericalEnvMap: {type: 'map'},
    src: {type: 'map'},
    width: {default: 512},
    wireframe: {default: false},
    wireframeLinewidth: {default: 2}
  },

  /**
   * Initializes the shader.
   * Adds a reference from the scene to this entity as the camera.
   */
  init: function (data) {
    this.material = new THREE.MeshStandardMaterial(getMaterialData(data));
    utils.material.updateMap(this, data);
    if (data.normalMap) { utils.material.updateDistortionMap('normal', this, data); }
    if (data.displacementMap) { utils.material.updateDistortionMap('displacement', this, data); }
    if (data.ambientOcclusionMap) { utils.material.updateDistortionMap('ambientOcclusion', this, data); }
    this.updateEnvMap(data);
  },

  update: function (data) {
    this.updateMaterial(data);
    utils.material.updateMap(this, data);
    if (data.normalMap) { utils.material.updateDistortionMap('normal', this, data); }
    if (data.displacementMap) { utils.material.updateDistortionMap('displacement', this, data); }
    if (data.ambientOcclusionMap) { utils.material.updateDistortionMap('ambientOcclusion', this, data); }
    this.updateEnvMap(data);
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
    var sphericalEnvMap = data.sphericalEnvMap;

    // No envMap defined or already loading.
    if ((!envMap && !sphericalEnvMap) || this.isLoadingEnvMap) {
      material.envMap = null;
      material.needsUpdate = true;
      return;
    }
    this.isLoadingEnvMap = true;

    // if a spherical env map is defined then use it.
    if (sphericalEnvMap) {
      this.el.sceneEl.systems.material.loadTexture(sphericalEnvMap, {src: sphericalEnvMap}, function textureLoaded (texture) {
        self.isLoadingEnvMap = false;
        texture.mapping = THREE.SphericalReflectionMapping;
        material.envMap = texture;
        utils.material.handleTextureEvents(self.el, texture);
        material.needsUpdate = true;
      });
      return;
    }

    // Another material is already loading this texture. Wait on promise.
    if (texturePromises[envMap]) {
      texturePromises[envMap].then(function (cube) {
        self.isLoadingEnvMap = false;
        material.envMap = cube;
        utils.material.handleTextureEvents(self.el, cube);
        material.needsUpdate = true;
      });
      return;
    }

    // Material is first to load this texture. Load and resolve texture.
    texturePromises[envMap] = new Promise(function (resolve) {
      utils.srcLoader.validateCubemapSrc(envMap, function loadEnvMap (urls) {
        CubeLoader.load(urls, function (cube) {
          // Texture loaded.
          self.isLoadingEnvMap = false;
          material.envMap = cube;
          utils.material.handleTextureEvents(self.el, cube);
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
  var newData = {
    color: new THREE.Color(data.color),
    fog: data.fog,
    metalness: data.metalness,
    roughness: data.roughness,
    wireframe: data.wireframe,
    wireframeLinewidth: data.wireframeLinewidth
  };

  if (data.normalMap) { newData.normalScale = data.normalScale; }

  if (data.ambientOcclusionMap) { newData.aoMapIntensity = data.ambientOcclusionMapIntensity; }

  if (data.displacementMap) {
    newData.displacementScale = data.displacementScale;
    newData.displacementBias = data.displacementBias;
  }

  return newData;
}
