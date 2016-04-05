var registerControls = require('../../core/controls').registerControls;
var THREE = require('../../lib/three');

// Tiny KeyboardEvent.code polyfill.
var KEYCODE_TO_CODE = {
  '38': 'ArrowUp',
  '37': 'ArrowLeft',
  '40': 'ArrowDown',
  '39': 'ArrowRight',
  '87': 'KeyW',
  '65': 'KeyA',
  '83': 'KeyS',
  '68': 'KeyD'
};

/**
 * Keyboard-controls component.
 *
 * Supports movement with WASD or arrow keys.
 */
module.exports.Component = registerControls('keyboard-controls', {
  schema: {
    enabled: { default: true },
    debug: { default: false }
  },

  init: function () {
    this.dVelocity = new THREE.Vector3();
    this.keys = {};
    this.bindMethods();
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
    this.keys = {};
  },

  remove: function () {
    this.pause();
  },

  bindMethods: function () {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onBlur = this.onBlur.bind(this);
  },

  addEventListeners: function () {
    window.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('keyup', this.onKeyUp, false);
    window.addEventListener('blur', this.onBlur, false);
  },

  removeEventListeners: function () {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  },

  isVelocityActive: function () {
    return this.data.enabled && !!Object.keys(this.keys).length;
  },

  getVelocityDelta: function () {
    var data = this.data;
    var keys = this.keys;

    this.dVelocity.set(0, 0, 0);
    if (data.enabled) {
      if (keys.KeyW || keys.ArrowUp) { this.dVelocity.z -= 1; }
      if (keys.KeyA || keys.ArrowLeft) { this.dVelocity.x -= 1; }
      if (keys.KeyS || keys.ArrowDown) { this.dVelocity.z += 1; }
      if (keys.KeyD || keys.ArrowRight) { this.dVelocity.x += 1; }
    }
    return this.dVelocity.clone();
  },

  onKeyDown: function (event) {
    var code = event.code || KEYCODE_TO_CODE[event.keyCode];
    this.keys[code] = true;
  },

  onKeyUp: function (event) {
    var code = event.code || KEYCODE_TO_CODE[event.keyCode];
    delete this.keys[code];
  },

  onBlur: function () {
    this.keys = {};
  }
});
