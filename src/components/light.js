var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

var id = 1;

/**
 * Light component.
 * Passes up light attributes to the vr-object.
 * vr-object will pass the light to vr-scene.
 * vr-scene will keep track of all the lights, and handle updating materials.
 *
 * Light direction and position are determined by its entity's rotation and
 * position.
 *
 * To support PBR, currently not using three.js lights. PBR materials are not
 * yet officially implemented by three.js.
 *
 * @param {string} color - light color.
 * @param {number} intensity - light strength.
 */
module.exports.Component = registerComponent('light', {
  defaults: {
    value: {
      color: '#ffffff',
      intensity: 1.0
    }
  },

  /**
   * Give light ID so scene can keep track of this light and make changes in
   * place.
   */
  init: {
    value: function () {
      this.id = this.id || id++;
      this.update();
    }
  },

  /**
   * Tells the light component's entity to tell the scene to update the light.
   */
  update: {
    value: function () {
      if (!this.data) { return; }

      var color = new THREE.Color(this.data.color);
      this.el.registerLight({
        id: this.id,
        color: new THREE.Vector3(color.r, color.g, color.b),
        intensity: this.data.intensity
      });
    }
  }
});
