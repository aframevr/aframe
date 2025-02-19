import { registerComponent as register } from '../../core/component.js';
import * as THREE from 'three';

/**
 * Fog component.
 * Applies only to the scene entity.
 */
export var Component = register('fog', {
  schema: {
    color: {type: 'color', default: '#000'},
    density: {default: 0.00025},
    far: {default: 1000, min: 0},
    near: {default: 1, min: 0},
    type: {default: 'linear', oneOf: ['linear', 'exponential']}
  },

  sceneOnly: true,

  update: function () {
    var data = this.data;
    var el = this.el;
    var fog = this.el.object3D.fog;

    // (Re)create fog if fog doesn't exist or fog type changed.
    if (!fog || data.type !== fog.name) {
      el.object3D.fog = getFog(data);
      return;
    }

    // Fog data changed. Update fog.
    Object.keys(this.schema).forEach(function (key) {
      var value = data[key];
      if (key === 'color') { value = new THREE.Color(value); }
      fog[key] = value;
    });
  },

  /**
   * Remove fog on remove (callback).
   */
  remove: function () {
    var el = this.el;
    var fog = this.el.object3D.fog;
    if (!fog) { return; }

    el.object3D.fog = null;
  }
});

/**
 * Creates a fog object. Sets fog.name to be able to detect fog type changes.
 *
 * @param {object} data - Fog data.
 * @returns {object} fog
 */
function getFog (data) {
  var fog;
  if (data.type === 'exponential') {
    fog = new THREE.FogExp2(data.color, data.density);
  } else {
    fog = new THREE.Fog(data.color, data.near, data.far);
  }
  fog.name = data.type;
  return fog;
}
