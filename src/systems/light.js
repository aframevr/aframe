var registerSystem = require('../core/system').registerSystem;

var DEFAULT_LIGHT_ATTR = 'data-aframe-default-light';

/**
 * Light system.
 *
 * Prescribes default lighting if not specified (one ambient, one directional).
 * Removes default lighting from the scene when a new light is added.
 *
 * @param {bool} defaultLightsEnabled - Whether default lighting is active.
 */
module.exports.System = registerSystem('light', {
  init: function () {
    this.defaultLightsEnabled = null;
    this.setupDefaultLights();
  },

  /**
   * Notify scene that light has been added and to remove the default.
   *
   * @param {object} el - element holding the light component.
   */
  registerLight: function (el) {
    var defaultLights;
    var sceneEl = this.sceneEl;

    if (this.defaultLightsEnabled && !el.hasAttribute(DEFAULT_LIGHT_ATTR)) {
      // User added a light, remove default lights through DOM.
      defaultLights = document.querySelectorAll('[' + DEFAULT_LIGHT_ATTR + ']');
      for (var i = 0; i < defaultLights.length; i++) {
        sceneEl.removeChild(defaultLights[i]);
      }
      this.defaultLightsEnabled = false;
    }
  },

  /**
   * Prescibe default lights to the scene.
   * Does so by injecting markup such that this state is not invisible.
   * These lights are removed if the user adds any lights.
   */
  setupDefaultLights: function () {
    var sceneEl = this.sceneEl;
    var ambientLight = document.createElement('a-entity');
    var directionalLight = document.createElement('a-entity');

    ambientLight.setAttribute('light',
                              {color: '#fff', type: 'ambient'});
    ambientLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
    sceneEl.appendChild(ambientLight);

    directionalLight.setAttribute('light', { color: '#fff', intensity: 0.2 });
    directionalLight.setAttribute('position', { x: -1, y: 2, z: 1 });
    directionalLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
    sceneEl.appendChild(directionalLight);

    this.defaultLightsEnabled = true;
  }
});
