/* global THREE */
var registerEffect = require('../../../core/effect').registerEffect;

require('../../../../vendor/effects/ShaderPass');
require('../../../../vendor/effects/SepiaShader');

registerEffect('sepia', {
  schema: {
    amount: {default: 1.0}
  },

  initPass: function () {
    this.pass = new THREE.ShaderPass(THREE.SepiaShader);
    this.update();
  },

  update: function () {
    if (!this.pass) { return; }
    this.pass.uniforms.amount.value = this.data.amount;
    this.pass.uniforms.needsUpdate = true;
  }
});
