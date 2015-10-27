var registerComponent = require('../core/register-component').registerComponent;
var pbrFragmentShader = require('../shaders/pbrFragment.glsl');
var pbrVertexShader = require('../shaders/pbrVertex.glsl');
var THREE = require('../../lib/three');

var MATERIAL_TYPE__PBR = 'ShaderMaterial';
var MATERIAL_TYPE__TEXTURE = 'MeshBasicMaterial';

var id = 1;

/**
 * Material component.
 *
 * Currently, hardcoded to use Physically-Based Rendering (PBR).
 * Our PBR shaders have been adapted from code online to be able to handle
 * non-hard-coded lighting.
 *
 * @params {string} color
 * @params {number} metallic
 * @params {number} roughness
 * @namespace material
 */
module.exports.Component = registerComponent('material', {
  defaults: {
    value: {
      color: 'red',
      metallic: 0.0,
      roughness: 0.5,
      opacity: 1.0
    }
  },

  init: {
    value: function () {
      this.id = this.id || id++;
      this.lights = this.lights || [];

      // Initialize material.
      this.el.object3D.material = this.getMaterial();

      // Register material to the scene to subscribe to light updates.
      this.el.sceneEl.registerMaterial(this.id, this);
    }
  },

  update: {
    value: function () {
      var material = this.el.object3D.material = this.getMaterial();

      // Update PBR uniforms.
      if (material.type === MATERIAL_TYPE__PBR) {
        var newUniform = this.getPBRUniforms();
        Object.keys(newUniform).forEach(function (key) {
          if (material.uniforms[key] !== newUniform[key]) {
            material.uniforms[key] = newUniform[key];
            material.needsUpdate = true;
          }
        });
      }
    }
  },

  /**
   * Store updated lights. Not used for texture materials.
   * If the number of lights changed, recreate material.
   * Else just update the material.
   *
   * @params (array) lights - array of light objects.
   */
  updateLights: {
    value: function (lights) {
      var previousLights = this.lights;
      this.lights = lights || [];

      if (this.el.object3D.material.type === MATERIAL_TYPE__TEXTURE) {
        // Lights not used for texture materials. Store lights anyways.
        return;
      }
      if (previousLights.length === this.lights.length) {
        // Attribute of light changed, update uniforms.
        this.update();
      } else {
        // Number of lights changed, need to recompile the shader.
        this.el.object3D.material = this.getMaterial();
      }
    }
  },

  getMaterial: {
    value: function () {
      var currentMaterial = this.el.object3D.material;
      var url = this.data.url;
      var isPBR = currentMaterial && currentMaterial.type === MATERIAL_TYPE__PBR;
      if (url) { return this.getTextureMaterial(); }
      if (isPBR) { return currentMaterial; }
      return this.getPBRMaterial();
    }
  },

  /**
   * Creates a new material object for handling textures.
   *
   * @returns {object} material - three.js MeshBasicMaterial.
   */
  getTextureMaterial: {
    value: function () {
      var data = this.data;
      var texture = THREE.ImageUtils.loadTexture(data.url);
      return new THREE.MeshBasicMaterial({
        color: data.color,
        side: THREE.DoubleSide,
        opacity: data.opacity,
        transparent: data.opacity < 1,
        map: texture
      });
    }
  },

  /**
   * Creates a new PBR material object.
   *
   * @returns {object} material - three.js ShaderMaterial.
   */
  getPBRMaterial: {
    value: function () {
      var data = this.data;
      return new THREE.ShaderMaterial({
        vertexShader: pbrVertexShader(),
        fragmentShader: pbrFragmentShader({
          // Keep this param > 1 since GLSL won't allow arrays w/ length=0.
          lightArraySize: this.lights.length || 1
        }),
        uniforms: this.getPBRUniforms(),
        transparent: data.opacity < 1
      });
    }
  },

  /**
   * Builds uniforms object given component attributes to pass into shaders.
   *
   * @returns {object} uniforms - shader uniforms.
   */
  getPBRUniforms: {
    value: function () {
      // Format baseColor to a vector.
      var color = new THREE.Color(this.data.color);
      color = new THREE.Vector3(color.r, color.g, color.b);

      var uniforms = {
        baseColor: {
          type: 'v3',
          value: color
        },
        metallic: {
          type: 'f',
          value: this.data.metallic
        },
        roughness: {
          type: 'f',
          value: this.data.roughness
        },
        opacity: {
          type: 'f',
          value: this.data.opacity
        },
        uvScale: {
          type: 'v2',
          value: new THREE.Vector2(1.0, 1.0)
        }
      };

      // Add lights to uniform.
      if (this.lights.length) {
        uniforms.lightColors = {
          type: '3fv',
          value: flattenVector3Array(
            this.lights.map(function (light) {
              return light.color;
            })
          )
        };
        uniforms.lightDirections = {
          type: '3fv',
          value: flattenVector3Array(
            this.lights.map(function (light) {
              return light.direction;
            })
          )
        };
        uniforms.lightIntensities = {
          type: 'iv1',
          value: this.lights.map(function (light) {
            // TODO: accept floats (e.g., 1.0), but JS keeps changing 1.0 -> 1.
            return Math.round(light.intensity);
          })
        };
        uniforms.lightPositions = {
          type: '3fv',
          value: flattenVector3Array(
            this.lights.map(function (light) {
              return light.position;
            })
          )
        };
      }

      // Add cubemap for reflections to uniform.
      // TODO: allow user to specify their own cubemap.
      for (var i = 0; i < 6; i++) {
        // See computeEnvColor() for explanation of cubemap.
        var path = '/examples/_images/pbr/maskonaive_m0' + i + '_c0';
        var format = '.png';
        var urls = [
          path + '0' + format, path + '1' + format,
          path + '2' + format, path + '3' + format,
          path + '4' + format, path + '5' + format
        ];
        var cubeMapMip = THREE.ImageUtils.loadTextureCube(urls);
        cubeMapMip.format = THREE.RGBFormat;

        uniforms['envMap' + i] = {
          type: 't',
          value: cubeMapMip
        };
      }

      return uniforms;
    }
  }
});

/**
 * Flattens an array of three-dimensional vectors into a single array.
 * Used to pass multiple vectors into the shader program using type 3fv.
 *
 * @param {array} vector3s - array of THREE.Vector3, the `s` denotes plural.
 * @returns {array} arr - float values.
 */
function flattenVector3Array (vector3s) {
  var arr = [];
  vector3s.forEach(function (vector3) {
    arr = arr.concat([vector3.x, vector3.y, vector3.z]);
  });
  return arr;
}
