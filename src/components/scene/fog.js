let register = require('../../core/component').registerComponent;
let THREE = require('../../lib/three');
let debug = require('../../utils/debug');

let warn = debug('components:fog:warn');

/**
 * Fog component.
 * Applies only to the scene entity.
 */
module.exports.Component = register('fog', {
  schema: {
    color: {type: 'color', default: '#000'},
    density: {default: 0.00025},
    far: {default: 1000, min: 0},
    near: {default: 1, min: 0},
    type: {default: 'linear', oneOf: ['linear', 'exponential']}
  },

  update: function () {
    let data = this.data;
    let el = this.el;
    let fog = this.el.object3D.fog;

    if (!el.isScene) {
      warn('Fog component can only be applied to <a-scene>');
      return;
    }

    // (Re)create fog if fog doesn't exist or fog type changed.
    if (!fog || data.type !== fog.name) {
      el.object3D.fog = getFog(data);
      el.systems.material.updateMaterials();
      return;
    }

    // Fog data changed. Update fog.
    Object.keys(this.schema).forEach(function (key) {
      let value = data[key];
      if (key === 'color') { value = new THREE.Color(value); }
      fog[key] = value;
    });
  },

  /**
   * Remove fog on remove (callback).
   */
  remove: function () {
    let fog = this.el.object3D.fog;
    if (!fog) { return; }
    fog.far = 0;
    fog.near = 0.1;
  }
});

/**
 * Creates a fog object. Sets fog.name to be able to detect fog type changes.
 *
 * @param {object} data - Fog data.
 * @returns {object} fog
 */
function getFog (data) {
  let fog;
  if (data.type === 'exponential') {
    fog = new THREE.FogExp2(data.color, data.density);
  } else {
    fog = new THREE.Fog(data.color, data.near, data.far);
  }
  fog.name = data.type;
  return fog;
}
