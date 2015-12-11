var diff = require('../utils').diff;
var debug = require('../utils/debug');
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../../lib/three');

var rad = THREE.Math.degToRad;
var warn = debug('components:light:warn');

/**
 * Light component.
 *
 * @namespace light
 * @param {number} [angle=60] - maximum extent of light from its direction,
          in degrees. For spot lights.
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
  schema: {
    angle: { default: 60, if: { type: ['spot'] } },
    color: { default: '#FFF' },
    groundColor: { default: '#FFF', if: { type: ['hemisphere'] } },
    decay: { default: 1, if: { type: ['point', 'spot'] } },
    distance: { default: 0.0, min: 0, if: { type: ['point', 'spot'] } },
    exponent: { default: 10.0, if: { type: ['spot'] } },
    intensity: { default: 1.0, min: 0, if: { type: ['directional', 'hemisphere', 'point', 'spot'] } },
    type: { default: 'directional',
            oneOf: ['ambient', 'directional', 'hemisphere', 'point', 'spot']
    }
  },

  /**
   * Notifies scene a light has been added to remove default lighting.
   */
  init: function () {
    var el = this.el;
    this.light = null;
    el.sceneEl.registerLight(el);
  },

  /**
   * (Re)create or update light.
   */
  update: function (oldData) {
    var data = this.data;
    var diffData = diff(data, oldData || {});
    var el = this.el;
    var light = this.light;

    // Existing light.
    if (light) {
      // Light type has changed. Recreate light.
      if ('type' in diffData) {
        var newLight = getLight(data);
        if (newLight) {
          el.object3D.remove(light);
          el.object3D.add(newLight);
          this.light = newLight;
        }
        return;
      }
      // Light type has not changed. Update light.
      Object.keys(diffData).forEach(function (key) {
        var value = data[key];
        if (['color', 'groundColor'].indexOf(key) !== -1) {
          value = new THREE.Color(value);
        }
        light[key] = value;
      });
      return;
    }

    // No light yet. Create and add light.
    this.light = getLight(data);
    if (this.light) {
      el.object3D.add(this.light);
    }
  },

  /**
   * Remove light on remove (callback).
   */
  remove: function () {
    if (this.light) { this.el.object3D.remove(this.light); }
  }
});

/**
 * Creates a new three.js light object given data object defining the light.
 *
 * @param {object} data
 */
function getLight (data) {
  var angle = data.angle;
  var color = new THREE.Color(data.color).getHex();
  var decay = data.decay;
  var distance = data.distance;
  var groundColor = new THREE.Color(data.groundColor).getHex();
  var intensity = data.intensity;
  var type = data.type;

  switch (type.toLowerCase()) {
    case 'ambient': {
      return new THREE.AmbientLight(color);
    }
    case 'directional': {
      return new THREE.DirectionalLight(color, intensity);
    }
    case 'hemisphere': {
      return new THREE.HemisphereLight(color, groundColor, intensity);
    }
    case 'point': {
      return new THREE.PointLight(color, intensity, distance, decay);
    }
    case 'spot': {
      return new THREE.SpotLight(color, intensity, distance, rad(angle), data.exponent,
                                 decay);
    }
    default: {
      warn('%s is not a valid light type. ' +
           'Choose from ambient, directional, hemisphere, point, spot.', type);
    }
  }
}
