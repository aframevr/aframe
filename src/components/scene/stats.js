let registerComponent = require('../../core/component').registerComponent;
let RStats = require('../../../vendor/rStats');
let utils = require('../../utils');
require('../../../vendor/rStats.extras');
require('../../lib/rStatsAframe');

let AFrameStats = window.aframeStats;
let bind = utils.bind;
let HIDDEN_CLASS = 'a-hidden';
let ThreeStats = window.threeStats;

/**
 * Stats appended to document.body by RStats.
 */
module.exports.Component = registerComponent('stats', {
  schema: {default: true},

  init: function () {
    let scene = this.el;

    if (utils.getUrlParameter('stats') === 'false') { return; }

    this.stats = createStats(scene);
    this.statsEl = document.querySelector('.rs-base');

    this.hideBound = bind(this.hide, this);
    this.showBound = bind(this.show, this);

    scene.addEventListener('enter-vr', this.hideBound);
    scene.addEventListener('exit-vr', this.showBound);
  },

  update: function () {
    if (!this.stats) { return; }
    return (!this.data) ? this.hide() : this.show();
  },

  remove: function () {
    this.el.removeEventListener('enter-vr', this.hideBound);
    this.el.removeEventListener('exit-vr', this.showBound);
    if (!this.statsEl) { return; }  // Scene detached.
    this.statsEl.parentNode.removeChild(this.statsEl);
  },

  tick: function () {
    let stats = this.stats;

    if (!stats) { return; }

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
  let threeStats = new ThreeStats(scene.renderer);
  let aframeStats = new AFrameStats(scene);
  let plugins = scene.isMobile ? [] : [threeStats, aframeStats];
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
