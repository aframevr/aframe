/* global THREE */
var registerEffect = require('../../../core/effect').registerEffect;

require('../../../../vendor/effects/CopyShader');
require('../../../../vendor/effects/ShaderPass');
require('../../../../vendor/effects/LuminosityHighPassShader');
require('../../../../vendor/effects/UnrealBloomPass');

registerEffect('bloom', {
  schema: {
    strength: {default: 1.5},
    radius: {default: 0.4},
    threshold: {default: 0.5}
  },

  initPass: function () {
    this.pass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  },

  update: function () {
    var data = this.data;
    var pass = this.pass;
    if (!pass) { return; }
    pass.strength = data.strength;
    pass.radius = data.radius;
    pass.threshold = data.threshold;
  }
});
