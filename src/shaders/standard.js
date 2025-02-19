import * as THREE from 'three';
import { registerShader } from '../core/shader.js';
import * as utils from '../utils/index.js';

/**
 * Standard (physically-based) shader using THREE.MeshStandardMaterial.
 */
export var Shader = registerShader('standard', {
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

    emissive: {type: 'color', default: '#000'},
    emissiveIntensity: {default: 1},

    envMap: {default: ''},

    fog: {default: true},

    metalness: {default: 0.0, min: 0.0, max: 1.0},
    metalnessMap: {type: 'map'},
    metalnessTextureOffset: {type: 'vec2'},
    metalnessTextureRepeat: {type: 'vec2', default: {x: 1, y: 1}},

    normalMap: {type: 'map'},
    normalScale: {type: 'vec2', default: {x: 1, y: 1}},
    normalTextureOffset: {type: 'vec2'},
    normalTextureRepeat: {type: 'vec2', default: {x: 1, y: 1}},

    offset: {type: 'vec2', default: {x: 0, y: 0}},
    repeat: {type: 'vec2', default: {x: 1, y: 1}},

    roughness: {default: 0.5, min: 0.0, max: 1.0},
    roughnessMap: {type: 'map'},
    roughnessTextureOffset: {type: 'vec2'},
    roughnessTextureRepeat: {type: 'vec2', default: {x: 1, y: 1}},

    sphericalEnvMap: {type: 'map'},
    src: {type: 'map'},
    wireframe: {default: false},
    wireframeLinewidth: {default: 2}
  },

  /**
   * Initializes the shader.
   * Adds a reference from the scene to this entity as the camera.
   */
  init: function (data) {
    this.materialData = {color: new THREE.Color(), emissive: new THREE.Color()};
    getMaterialData(data, this.materialData);
    this.material = new THREE.MeshStandardMaterial(this.materialData);
  },

  update: function (data) {
    this.updateMaterial(data);
    utils.material.updateMap(this, data);
    utils.material.updateDistortionMap('normal', this, data);
    utils.material.updateDistortionMap('displacement', this, data);
    utils.material.updateDistortionMap('ambientOcclusion', this, data);
    utils.material.updateDistortionMap('metalness', this, data);
    utils.material.updateDistortionMap('roughness', this, data);
    utils.material.updateEnvMap(this, data);
  },

  /**
   * Updating existing material.
   *
   * @param {object} data - Material component data.
   */
  updateMaterial: function (data) {
    var key;
    var material = this.material;
    getMaterialData(data, this.materialData);
    for (key in this.materialData) {
      material[key] = this.materialData[key];
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
  materialData.emissive.set(data.emissive);
  materialData.emissiveIntensity = data.emissiveIntensity;
  materialData.fog = data.fog;
  materialData.metalness = data.metalness;
  materialData.roughness = data.roughness;
  materialData.wireframe = data.wireframe;
  materialData.wireframeLinewidth = data.wireframeLinewidth;

  if (data.normalMap) { materialData.normalScale = data.normalScale; }

  if (data.ambientOcclusionMap) {
    materialData.aoMapIntensity = data.ambientOcclusionMapIntensity;
  }

  if (data.displacementMap) {
    materialData.displacementScale = data.displacementScale;
    materialData.displacementBias = data.displacementBias;
  }

  return materialData;
}
