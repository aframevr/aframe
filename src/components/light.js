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
    angle: {default: 60, if: {type: ['spot']}},
    color: {type: 'color'},
    groundColor: {type: 'color', if: {type: ['hemisphere']}},
    decay: {default: 1, if: {type: ['point', 'spot']}},
    distance: {default: 0.0, min: 0, if: {type: ['point', 'spot']}},
    intensity: {default: 1.0, min: 0,
                if: {type: ['ambient', 'directional', 'hemisphere', 'point', 'spot']}},
    penumbra: {default: 0, min: 0, max: 1, if: {type: ['spot']}},
    type: {default: 'directional',
           oneOf: ['ambient', 'directional', 'hemisphere', 'point', 'spot']},
    target: {type: 'selector', if: {type: ['spot', 'directional']}}
  },

  /**
   * Notifies scene a light has been added to remove default lighting.
   */
  init: function () {
    var el = this.el;
    this.light = null;
    this.defaultTarget = null;
    this.system.registerLight(el);
  },

  /**
   * (Re)create or update light.
   */
  update: function (oldData) {
    var data = this.data;
    var diffData = diff(data, oldData);
    var light = this.light;
    var self = this;

    // Existing light.
    if (light && !('type' in diffData)) {
      // Light type has not changed. Update light.
      Object.keys(diffData).forEach(function (key) {
        var value = data[key];

        switch (key) {
          case 'color': {
            light.color.set(value);
            break;
          }

          case 'groundcolor': {
            light.groundColor.set(value);
            break;
          }

          case 'angle': {
            light.angle = degToRad(value);
            break;
          }

          case 'target': {
            // Reset target if selector is null.
            if (value === null) {
              if (data.type === 'spot' || data.type === 'directional') {
                light.target = self.defaultTarget;
              }
            } else {
              // Target specified, set target using entity's `object3D`.
              light.target = value.object3D;
            }
            break;
          }

          default: {
            light[key] = value;
          }
        }
      });
      return;
    }

    // No light yet or light type has changed. Create and add light.
    this.setLight(this.data);
  },

  setLight: function (data) {
    var el = this.el;
    var newLight = this.getLight(data);
    if (newLight) {
      if (this.light) {
        el.removeObject3D('light');
      }

      this.light = newLight;
      this.light.el = el;
      el.setObject3D('light', this.light);

      if (data.type === 'spot') {
        // HACK solution for issue #1624
        el.getObject3D('light').translateY(-1);
        // set and position default lighttarget as a child to enable spotlight orientation
        el.setObject3D('light-target', this.defaultTarget);
        el.getObject3D('light-target').position.set(0, 0, -1);
      }
    }
  },

  /**
   * Creates a new three.js light object given data object defining the light.
   *
   * @param {object} data
   */
  getLight: function (data) {
    var angle = data.angle;
    var color = new THREE.Color(data.color).getHex();
    var decay = data.decay;
    var distance = data.distance;
    var groundColor = new THREE.Color(data.groundColor).getHex();
    var intensity = data.intensity;
    var type = data.type;
    var target = data.target;
    var light = null;

    switch (type.toLowerCase()) {
      case 'ambient': {
        return new THREE.AmbientLight(color, intensity);
      }

      case 'directional': {
        light = new THREE.DirectionalLight(color, intensity);
        this.defaultTarget = light.target;
        if (target) {
          light.target = target.object3D;
        }
        return light;
      }

      case 'hemisphere': {
        return new THREE.HemisphereLight(color, groundColor, intensity);
      }

      case 'point': {
        return new THREE.PointLight(color, intensity, distance, decay);
      }

      case 'spot': {
        light = new THREE.SpotLight(color, intensity, distance, degToRad(angle), data.penumbra, decay);
        this.defaultTarget = light.target;
        if (target) {
          light.target = target.object3D;
        }
        return light;
      }

      default: {
        warn('%s is not a valid light type. ' +
           'Choose from ambient, directional, hemisphere, point, spot.', type);
      }
    }
  },

  /**
   * Remove light on remove (callback).
   */
  remove: function () {
    this.el.removeObject3D('light');
  }
});
