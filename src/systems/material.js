var registerSystem = require('../core/system').registerSystem;

module.exports.System = registerSystem('material', {
  init: function () {
    this.materials = {};
  },

  /**
   * Keep track of material in case an update trigger is needed (e.g., fog).
   *
   * @param {object} material
   */
  registerMaterial: function (material) {
    this.materials[material.uuid] = material;
  },

  /**
   * Stops tracking material.
   *
   * @param {object} material
   */
  unregisterMaterial: function (material) {
    delete this.materials[material.uuid];
  },

  /**
   * Trigger update to all registered materials.
   */
  updateMaterials: function (material) {
    var materials = this.materials;
    Object.keys(materials).forEach(function (uuid) {
      materials[uuid].needsUpdate = true;
    });
  }

});
