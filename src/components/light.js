var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

/**
 * Light component.
 *
 * @namespace light
 * @param {number} [angle=PI / 3] - maximum extent of light from its direction,
          in radians. For spot lights.
 * @param {string} [color=#FFF] - light color. For every light.
 * @param {number} [decay=1] - amount the light dims along the distance of the
          light. For point and spot lights.
 * @param {number} [exponent=10.0] - rapidity of falloff of light from its
          target direction. For spot lights.
 * @param {string} [groundColor=#FFF] - ground light color. For hemisphere lights.
 * @param {number} [intensity=1.0] - light strength. For every light except
          ambient.
 * @param {string} [type=directional] - light type (ambient, directional,
          hemisphere, point, spot).
 */
module.exports.Component = registerComponent('light', {
  defaults: {
    value: {
      angle: Math.PI / 3,
      color: '#FFF',
      groundColor: '#FFF',
      decay: 1,
      distance: 0.0,
      exponent: 10.0,
      intensity: 1.0,
      type: 'directional'
    }
  },

  init: {
    value: function () {
      var el = this.el;
      this.light = this.getLight();
      el.object3D.add(this.light);
      el.sceneEl.registerLight(el);
    }
  },

  update: {
    value: function () {
      var el = this.el;
      el.object3D.remove(this.light);
      this.light = this.getLight();
      el.object3D.add(this.light);
    }
  },

  /**
   * Creates a new three.js light object given the current attributes of the
   * component.
   *
   * @namespace light
   */
  getLight: {
    value: function () {
      var data = this.data;
      var color = new THREE.Color(data.color).getHex();
      var intensity = data.intensity;
      var type = data.type;

      if (type) {
        type = type.toLowerCase();
      }
      switch (type) {
        case 'ambient': {
          return new THREE.AmbientLight(color);
        }
        case 'directional': {
          return new THREE.DirectionalLight(color, intensity);
        }
        case 'hemisphere': {
          return new THREE.HemisphereLight(
            color, this.data.groundColor, intensity);
        }
        case 'point': {
          return new THREE.PointLight(color, intensity, data.distance,
                                      data.decay);
        }
        case 'spot': {
          return new THREE.SpotLight(color, intensity, data.distance,
                                     data.angle, data.exponent, data.decay);
        }
        default: {
          return new THREE.AmbientLight(color);
        }
      }
    }
  }
});
