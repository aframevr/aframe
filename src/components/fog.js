var register = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

/**
 * Fog component.
 * Applies only to the scene itself.
 */
module.exports.Component = register('fog', {
  defaults: {
    value: {
      color: '#000',
      density: 0.00025,
      far: 1000,
      near: 1,
      type: 'linear'
    }
  },

  update: {
    value: function () {
      var data = this.data;
      var el = this.el;
      var fog = this.el.object3D.fog;

      if (!el.isScene) { return; }

      // (Re)create fog if fog doesn't exist or fog type changed.
      if (!fog || data.type !== fog.name) {
        el.object3D.fog = this.getFog();
        return;
      }

      // Fog data changed. Update fog.
      Object.keys(this.defaults).forEach(function (key) {
        var value = data[key];
        if (key === 'color') { value = new THREE.Color(value); }
        fog[key] = value;
      });
    }
  },

  /**
   * Remove fog on remove (callback).
   */
  remove: {
    value: function () {
      var fog = this.el.object3D.fog;
      if (fog) {
        fog.density = 0;
        fog.far = 0;
        fog.near = 0;
      }
    }
  },

  /**
   * Creates a fog object. Sets fog.name to be able to detect fog type changes.
   *
   * @returns {object} fog
   */
  getFog: {
    value: function () {
      var data = this.data;
      var fog;
      if (data.type === 'exponential') {
        fog = new THREE.FogExp2(data.color, data.density);
      } else {
        fog = new THREE.Fog(data.color, data.near, data.far);
      }
      fog.name = data.type;
      return fog;
    }
  }
});
