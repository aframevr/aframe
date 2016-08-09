/* global MutationObserver */
var debug = require('../utils/debug');
var shader = require('../core/shader');
var registerShader = shader.registerShader;
var warn = debug('shaders:toy:warn').warn;

/**
 * Toy shader.
 *
 * @namespace flat
 * @param {string} fragmentSrc - Src of the fragment shader.
 *
 */
module.exports.Component = registerShader('toy', {
  schema: {
    camera: { type: 'camera', is: 'uniform', default: '0 0 0' },
    resolution: { type: 'resolution', is: 'uniform', default: '0 0' },
    fragmentSrc: { default: '' },
    time: { type: 'time', is: 'uniform' },
    pixelRatio: { type: 'number', is: 'uniform', default: window.devicePixelRatio },
    randomSeed: { type: 'number', is: 'uniform', default: Math.random() },
    raymarchMaximumDistance: { type: 'number', is: 'uniform', default: 50 },
    raymarchPrecision: { type: 'number', is: 'uniform', default: 0.01 }
  },
  fragmentShader: 'void main() { gl_FragColor = vec4(0.0,0.0,1.0,1.0); }',
  vertexShader: 'void main() { gl_Position = vec4(position, 1.0); }',
  update: function (data) {
    shader.Shader.prototype.update.call(this, data);
    if (data.fragmentSrc) { this.updateFragment(data.fragmentSrc); }
  },

  updateFragment: function (id) {
    var fragmentEl;
    var observer = this.observer = this.observer || new MutationObserver(this.updateMaterialFragment.bind(this));
    var config;
    if (this.currentFragmentEl && id === this.currentFragmentEl.id) { return; }
    fragmentEl = document.querySelector('#' + id);
    if (!fragmentEl) { warn('The el with selector ' + id + ' is not a valid shader'); }
    this.currentFragmentEl = fragmentEl;
    config = { subtree: true, characterData: true };
    observer.disconnect();
    observer.observe(fragmentEl, config);
    this.updateMaterialFragment();
  },

  updateMaterialFragment: function () {
    this.material.fragmentShader = this.currentFragmentEl.innerHTML;
    this.material.needsUpdate = true;
  }

});

