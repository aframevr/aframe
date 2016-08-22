var registerComponent = require('../../core/component').registerComponent;
var RStats = require('../../../vendor/rStats');
var bind = require('../../utils/bind');
require('../../../vendor/rStats.extras');
require('../../lib/rStatsAframe');

var HIDDEN_CLASS = 'a-hidden';
var ThreeStats = window.threeStats;
var AFrameStats = window.aframeStats;

/**
 * Stats appended to document.body by RStats.
 */
module.exports.Component = registerComponent('stats', {
  schema: {default: true},

  init: function () {
    var scene = this.el;
    this.stats = createStats(scene);
    this.statsEl = document.querySelector('.rs-base');

    this.hideBound = bind(this.hide, this);
    this.showBound = bind(this.show, this);

    scene.addEventListener('enter-vr', this.hideBound);
    scene.addEventListener('exit-vr', this.showBound);
  },

  update: function () {
    return (!this.data) ? this.hide() : this.show();
  },

  remove: function () {
    this.el.removeEventListener('enter-vr', this.hideBound);
    this.el.removeEventListener('exit-vr', this.showBound);
    this.statsEl.parentNode.removeChild(this.statsEl);
  },

  tick: function () {
    var stats = this.stats;
    stats('rAF').tick();
    stats('FPS').frame();
    stats().update();
  },

  hide: function () {
    this.statsEl.classList.add(HIDDEN_CLASS);
  },

  show: function () {
    this.statsEl.classList.remove(HIDDEN_CLASS);
  }
});

function createStats (scene) {
  var threeStats = new ThreeStats(scene.renderer);
  var aframeStats = new AFrameStats(scene);
  var plugins = scene.isMobile ? [] : [threeStats, aframeStats];
  return new RStats({
    css: [],  // Our stylesheet is injected from `src/index.js`.
    values: {
      fps: {caption: 'fps', below: 30}
    },
    groups: [
      {caption: 'Framerate', values: ['fps', 'raf']}
    ],
    plugins: plugins
  });
}
