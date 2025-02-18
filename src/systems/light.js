import { registerSystem } from '../core/system.js';
import * as constants from '../constants/index.js';

var DEFAULT_LIGHT_ATTR = 'data-aframe-default-light';

/**
 * Light system.
 *
 * Prescribes default lighting if not specified (one ambient, one directional).
 * Removes default lighting from the scene when a new light is added.
 *
 * @param {boolean} defaultLights - Whether default lighting are defined.
 * @param {boolean} userDefinedLights - Whether user lighting is defined.
 */
export var System = registerSystem('light', {
  schema: {
    defaultLightsEnabled: {default: true}
  },

  init: function () {
    this.defaultLights = false;
    this.userDefinedLights = false;
    // Wait for all entities to fully load before checking for existence of lights.
    // Since entities wait for <a-assets> to load, any lights attaching to the scene
    // will do so asynchronously.
    this.sceneEl.addEventListener('loaded', this.setupDefaultLights.bind(this));
  },

  /**
   * Notify scene that light has been added and to remove the default.
   *
   * @param {object} el - element holding the light component.
   */
  registerLight: function (el) {
    if (!el.hasAttribute(DEFAULT_LIGHT_ATTR)) {
      // User added a light, remove default lights through DOM.
      this.removeDefaultLights();
      this.userDefinedLights = true;
    }
  },

  removeDefaultLights: function () {
    var defaultLights;
    var sceneEl = this.sceneEl;

    if (!this.defaultLights) { return; }
    defaultLights = document.querySelectorAll('[' + DEFAULT_LIGHT_ATTR + ']');
    for (var i = 0; i < defaultLights.length; i++) {
      sceneEl.removeChild(defaultLights[i]);
    }
    this.defaultLights = false;
  },

  /**
   * Prescribe default lights to the scene.
   * Does so by injecting markup such that this state is not invisible.
   * These lights are removed if the user adds any lights.
   */
  setupDefaultLights: function () {
    var sceneEl = this.sceneEl;
    var ambientLight;
    var directionalLight;

    if (this.userDefinedLights || this.defaultLights || !this.data.defaultLightsEnabled) {
      return;
    }

    ambientLight = document.createElement('a-entity');
    ambientLight.setAttribute('light', {color: '#BBB', type: 'ambient'});
    ambientLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
    ambientLight.setAttribute(constants.AFRAME_INJECTED, '');
    sceneEl.appendChild(ambientLight);

    directionalLight = document.createElement('a-entity');
    directionalLight.setAttribute('light', {color: '#FFF', intensity: 1.884, castShadow: true});
    directionalLight.setAttribute('position', {x: -0.5, y: 1, z: 1});
    directionalLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
    directionalLight.setAttribute(constants.AFRAME_INJECTED, '');
    sceneEl.appendChild(directionalLight);

    this.defaultLights = true;
  }
});
