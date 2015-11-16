var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

// Used to detect whether light type has changed.
// TODO: use update() diff once that is implemented.
var LIGHT_TYPES = {
  'ambient': 'AmbientLight',
  'directional': 'DirectionalLight',
  'hemisphere': 'HemisphereLight',
  'point': 'PointLight',
  'spot': 'SpotLight'
};

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
 * @param {string} [groundColor=#FFF] - ground light color. For hemisphere
          lights.
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

  /**
   * Notifies scene a light has been added to remove default lighting.
   */
  init: {
    value: function () {
      var el = this.el;
      this.light = null;
      el.sceneEl.registerLight(el);
    }
  },

  update: {
    value: function () {
      var data = this.data;
      var el = this.el;
      var light = this.light;

      // Existing light.
      if (light) {
        // Light type has changed. Recreate light.
        if (LIGHT_TYPES[data.type] !== light.type) {
          var newLight = this.getLight();
          el.object3D.remove(light);
          el.object3D.add(newLight);
          this.light = newLight;
          return;
        }
        // Light type has not changed. Update light.
        Object.keys(this.defaults).forEach(function (key) {
          var value = data[key];
          if (['color', 'groundColor'].indexOf(key) !== -1) {
            value = new THREE.Color(value);
          }
          light[key] = value;
        });
        return;
      }

      // No light yet. Create and add light.
      this.light = this.getLight();
      el.object3D.add(this.light);
    }
  },

  /**
   * Remove light on remove (callback).
   */
  remove: {
    value: function () {
      if (this.light) { this.el.object3D.remove(this.light); }
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
          return new THREE.DirectionalLight(color, intensity);
        }
      }
    }
  }
});
