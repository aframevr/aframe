var registerControls = require('../../core/controls').registerControls;
var THREE = require('../../lib/three');
var utils = require('../../utils');

var warn = utils.debug('components:touch-controls:warn');

/**
 * Touch-controls component.
 *
 * Moves forward in the scene when canvas (or Cardboard button) is touched.
 */
module.exports.Component = registerControls('touch-controls', {
  schema: {
    enabled: { default: true }
  },

  init: function () {
    this.isMoving = false;
    this.dVelocity = new THREE.Vector3();
    this.bindMethods();
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
    this.dVelocity.set(0, 0, 0);
  },

  remove: function () {
    this.pause();
  },

  addEventListeners: function () {
    var sceneEl = this.el.sceneEl;
    var canvasEl = sceneEl.canvas;

    if (!sceneEl) {
      // TODO: Mock the scene, or stub this component in unrelated tests.
      warn('Scene not defined during component initialization');
      return;
    }

    // listen for canvas to load.
    if (!canvasEl) {
      sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
      return;
    }

    canvasEl.addEventListener('touchstart', this.onTouchStart);
    canvasEl.addEventListener('touchend', this.onTouchEnd);
  },

  removeEventListeners: function () {
    var canvasEl = this.el.sceneEl && this.el.sceneEl.canvas;
    if (!canvasEl) { return; }

    canvasEl.removeEventListener('touchstart', this.onTouchStart);
    canvasEl.removeEventListener('touchend', this.onTouchEnd);
  },

  isVelocityActive: function () {
    return this.data.enabled && this.isMoving;
  },

  getVelocityDelta: function () {
    var dVelocity = this.dVelocity;
    dVelocity.z = this.isMoving ? -1 : 0;
    return dVelocity.clone();
  },

  bindMethods: function () {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  },

  onTouchStart: function (e) {
    this.isMoving = true;
    e.preventDefault();
  },

  onTouchEnd: function (e) {
    this.isMoving = false;
    e.preventDefault();
  }
});
