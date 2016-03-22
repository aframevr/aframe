var registerComponent = require('../../core/component').registerComponent;
var RStats = require('../../../vendor/rStats');

var HIDDEN_CLASS = 'a-hidden';

/**
 * Stats appended to document.body by RStats.
 */
module.exports.Component = registerComponent('stats', {
  init: function () {
    var scene = this.el;

    this.stats = createStats();
    this.statsEl = document.querySelector('.rs-base');

    this.hideBound = this.hide.bind(this);
    this.showBound = this.show.bind(this);

    scene.addEventListener('enter-vr', this.hideBound);
    scene.addEventListener('exit-vr', this.showBound);
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

function createStats () {
  return new RStats({
    css: [],  // Our stylesheet is injected from `src/index.js`.
    values: {
      fps: { caption: 'fps', below: 30 }
    },
    groups: [
      { caption: 'Framerate', values: [ 'fps', 'raf' ] }
    ]
  });
}
