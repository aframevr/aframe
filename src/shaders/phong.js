import { registerShader } from '../core/shader.js';
import * as THREE from 'three';
import * as utils from '../utils/index.js';

/**
 * Phong shader using THREE.MeshPhongMaterial.
 */
export var Shader = registerShader('phong', {
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

    ambientOcclusionMap: {type: 'map'},
    ambientOcclusionMapIntensity: {default: 1},

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
    this.materialData = { color: new THREE.Color(), specular: new THREE.Color(), emissive: new THREE.Color() };
    getMaterialData(data, this.materialData);
    this.material = new THREE.MeshPhongMaterial(this.materialData);
    var sceneEl = this.el.sceneEl;
    // Fallback to scene environment when no envMap is defined (matching behaviour of standard material)
    Object.defineProperty(this.material, 'envMap', {
      get: function () {
        return this._envMap || sceneEl.object3D.environment;
      },
      set: function (value) {
        this._envMap = value;
      }
    });
  },

  update: function (data) {
    this.updateMaterial(data);
    utils.material.updateMap(this, data);
    utils.material.updateDistortionMap('normal', this, data);
    utils.material.updateDistortionMap('displacement', this, data);
    utils.material.updateDistortionMap('ambientOcclusion', this, data);
    utils.material.updateDistortionMap('bump', this, data);
    utils.material.updateEnvMap(this, data);
  },

  /**
   * Updating existing material.
   *
   * @param {object} data - Material component data.
   */
  updateMaterial: function (data) {
    var key;
    getMaterialData(data, this.materialData);
    for (key in this.materialData) {
      this.material[key] = this.materialData[key];
    }
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
  materialData.specular.set(data.specular);
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
    materialData.bumpScale = data.bumpMapScale;
  }

  if (data.displacementMap) {
    materialData.displacementScale = data.displacementScale;
    materialData.displacementBias = data.displacementBias;
  }

  return materialData;
}
