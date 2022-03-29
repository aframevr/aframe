var registerShader = require('../core/shader').registerShader;
var THREE = require('../lib/three');
var utils = require('../utils/');

var CubeLoader = new THREE.CubeTextureLoader();
var texturePromises = {};

/**
 * Phong shader using THREE.MeshPhongMaterial.
 */
module.exports.Shader = registerShader('phong', {
  schema: {
    color: { type: 'color' },
    emissive: { type: 'color', default: 'black' },
    emissiveIntensity: { default: 1 },
    specular: { type: 'color', default: '#111111' },
    transparent: { default: false },
    fog: { default: true },
    offset: { type: 'vec2', default: { x: 0, y: 0 } },
    repeat: { type: 'vec2', default: { x: 1, y: 1 } },
    src: { type: 'map' },
    envMap: { default: '' },
    sphericalEnvMap: { type: 'map' },
    shininess: { default: 30 },
    flatShading: { default: false },
    wireframe: { default: false },
    wireframeLinewidth: { default: 2 },
    combine: { oneOF: ['multiply', 'mix', 'add'], default: 'mix' },
    reflectivity: { default: 0.9 },
    refractionRatio: { default: 0.98 },
    refract: { default: false },

    normalMap: { type: 'map' },
    normalScale: { type: 'vec2', default: { x: 1, y: 1 } },
    normalTextureOffset: { type: 'vec2' },
    normalTextureRepeat: { type: 'vec2', default: { x: 1, y: 1 } },

    displacementMap: { type: 'map' },
    displacementScale: { default: 1 },
    displacementBias: { default: 0.5 },
    displacementTextureOffset: { type: 'vec2' },
    displacementTextureRepeat: { type: 'vec2', default: { x: 1, y: 1 } },

    bumpMap: { type: 'map' },
    bumpMapScale: { default: 1 },
    bumpTextureOffset: { type: 'vec2' },
    bumpTextureRepeat: { type: 'vec2', default: { x: 1, y: 1 } }
  },

  /**
   * Initializes the shader.
   * Adds a reference from the scene to this entity as the camera.
   */
  init: function (data) {
    this.rendererSystem = this.el.sceneEl.systems.renderer;
    this.materialData = { color: new THREE.Color(), specular: new THREE.Color(), emissive: new THREE.Color() };
    this.textureSrc = null;
    getMaterialData(data, this.materialData);
    this.rendererSystem.applyColorCorrection(this.materialData.color);
    this.material = new THREE.MeshPhongMaterial(this.materialData);
    utils.material.updateMap(this, data);
  },

  update: function (data) {
    this.updateMaterial(data);
    utils.material.updateMap(this, data);
    if (data.normalMap) { utils.material.updateDistortionMap('normal', this, data); }
    if (data.displacementMap) { utils.material.updateDistortionMap('displacement', this, data); }
    if (data.ambientOcclusionMap) { utils.material.updateDistortionMap('ambientOcclusion', this, data); }
    if (data.bump) { utils.material.updateDistortionMap('bump', this, data); }
    this.updateEnvMap(data);
  },

  /**
   * Updating existing material.
   *
   * @param {object} data - Material component data.
   */
  updateMaterial: function (data) {
    var key;
    getMaterialData(data, this.materialData);
    this.rendererSystem.applyColorCorrection(this.materialData.color);
    for (key in this.materialData) {
      this.material[key] = this.materialData[key];
    }
  },

  /**
   * Handle environment cubemap. Textures are cached in texturePromises.
   */
  updateEnvMap: function (data) {
    var self = this;
    var material = this.material;
    var envMap = data.envMap;
    var sphericalEnvMap = data.sphericalEnvMap;
    var refract = data.refract;
    var sceneEl = this.el.sceneEl;

    // No envMap defined or already loading.
    if ((!envMap && !sphericalEnvMap) || this.isLoadingEnvMap) {
      Object.defineProperty(material, 'envMap', {
        get: function () {
          return sceneEl.object3D.environment;
        },
        set: function (value) {
          delete this.envMap;
          this.envMap = value;
        }
      });
      material.needsUpdate = true;
      return;
    }
    this.isLoadingEnvMap = true;
    delete material.envMap;

    // if a spherical env map is defined then use it.
    if (sphericalEnvMap) {
      this.el.sceneEl.systems.material.loadTexture(sphericalEnvMap, { src: sphericalEnvMap }, function textureLoaded (texture) {
        self.isLoadingEnvMap = false;
        texture.mapping = refract ? THREE.EquirectangularRefractionMapping : THREE.EquirectangularReflectionMapping;

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
          cube.mapping = refract ? THREE.CubeRefractionMapping : THREE.CubeReflectionMapping;
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
 * @param {object} materialData - Object to use.
 * @returns {object} Updated materialData.
 */
function getMaterialData (data, materialData) {
  materialData.color.set(data.color);
  materialData.specular.set(data.emissive);
  materialData.emissive.set(data.emissive);
  materialData.emissiveIntensity = data.emissiveIntensity;
  materialData.fog = data.fog;
  materialData.transparent = data.transparent;
  materialData.wireframe = data.wireframe;
  materialData.wireframeLinewidth = data.wireframeLinewidth;
  materialData.shininess = data.shininess;
  materialData.flatShading = data.flatShading;
  materialData.wireframe = data.wireframe;
  materialData.wireframeLinewidth = data.wireframeLinewidth;
  materialData.reflectivity = data.reflectivity;
  materialData.refractionRatio = data.refractionRatio;

  switch (data.combine) {
    case 'mix':
      materialData.combine = THREE.MixOperation;
      break;
    case 'multiply':
      materialData.combine = THREE.MultiplyOperation;
      break;
    case 'add':
      materialData.combine = THREE.AddOperation;
      break;
  }

  if (data.normalMap) {
    materialData.normalScale = data.normalScale;
  }

  if (data.ambientOcclusionMap) {
    materialData.aoMapIntensity = data.ambientOcclusionMapIntensity;
  }

  if (data.bumpMap) {
    materialData.aoMapIntensity = data.bumpMapScale;
  }

  if (data.displacementMap) {
    materialData.displacementScale = data.displacementScale;
    materialData.displacementBias = data.displacementBias;
  }

  return materialData;
}
