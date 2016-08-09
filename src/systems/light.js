var registerSystem = require('../core/system').registerSystem;
var constants = require('../constants/');

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

    ambientLight.setAttribute('light', {color: '#BBB', type: 'ambient'});
    ambientLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
    ambientLight.setAttribute(constants.AFRAME_INJECTED, '');
    sceneEl.appendChild(ambientLight);

    directionalLight.setAttribute('light', {color: '#FFF', intensity: 0.6});
    directionalLight.setAttribute('position', {x: -0.5, y: 1, z: 1});
    directionalLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
    directionalLight.setAttribute(constants.AFRAME_INJECTED, '');
    sceneEl.appendChild(directionalLight);

    this.defaultLightsEnabled = true;
  }
});
