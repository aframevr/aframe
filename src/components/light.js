var diff = require('../utils').diff;
var debug = require('../utils/debug');
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

var degToRad = THREE.Math.degToRad;
var warn = debug('components:light:warn');

/**
 * Light component.
 */
module.exports.Component = registerComponent('light', {
  schema: {
    angle: { default: 60, if: { type: ['spot'] } },
    color: { default: '#FFF', type: 'color' },
    groundColor: { default: '#FFF', type: 'color', if: { type: ['hemisphere'] } },
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
    this.system.registerLight(el);
  },

  /**
   * (Re)create or update light.
   */
  update: function (oldData) {
    var data = this.data;
    var diffData = diff(data, oldData || {});
    var light = this.light;

    // Existing light.
    if (light && !('type' in diffData)) {
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

    // No light yet or light type has changed. Create and add light.
    this.setLight(this.data);
  },

  setLight: function (data) {
    var el = this.el;

    var newLight = getLight(data);
    if (newLight) {
      if (this.light) {
        el.removeObject3D('light');
      }

      this.light = newLight;
      this.light.el = el;
      el.setObject3D('light', this.light);
    }
  },

  /**
   * Remove light on remove (callback).
   */
  remove: function () {
    this.el.removeObject3D('light');
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
      return new THREE.SpotLight(color, intensity, distance, degToRad(angle), data.exponent,
                                 decay);
    }
    default: {
      warn('%s is not a valid light type. ' +
           'Choose from ambient, directional, hemisphere, point, spot.', type);
    }
  }
}
