var registerComponent = require('../../core/component').registerComponent;
var RStats = require('../../../vendor/rStats');
var utils = require('../../utils');
require('../../../vendor/rStats.extras');
require('../../lib/rStatsAframe');

var AFrameStats = window.aframeStats;
var ThreeStats = window.threeStats;

/**
 * Stats appended to document.body by RStats.
 */
module.exports.Component = registerComponent('stats', {
  schema: {default: true},

  init: function () {
    var scene = this.el;

    if (utils.getUrlParameter('stats') === 'false') { return; }

    this.stats = createStats(scene);
    this.statsEl = document.querySelector('.rs-base');

    this.lastTime = Date.now();

    // hide the DOM stats panel
    this.statsEl.style = 'display: none !important';
    this.statsEl.className = 'a-hidden';

    // defer most initialization until after camera is injected
    var self = this;
    setTimeout(function () {
      // attached to scene element, so inject stats panel into camera
      self.statspanel = document.createElement('a-entity');
      self.statspanel.setAttribute('id', 'statspanel');
      self.statspanel.setAttribute('position', '0 -0.35 -0.5');
      self.statspanel.setAttribute('scale', '0.5 0.5 1');
      self.statspanel.setAttribute('visible', self.data ? 'true' : 'false');
      self.el.camera.el.appendChild(self.statspanel);

      // set up the VR stats panel
      self.valuecanvases = [];
      self.rsids = [];
      self.rsvalues = [];
      var rscanvases = document.querySelectorAll('.rs-canvas');
      for (var i = 0; i < rscanvases.length; i++) {
        // remember labels and vale elements
        self.rsids.push(rscanvases[i].parentElement.querySelector('.rs-counter-id').innerText);
        self.rsvalues.push(rscanvases[i].parentElement.querySelector('.rs-counter-value'));

        // inject id values for rstats canvases
        var idsuffix = self.rsids[i].replace(' ', '_');
        rscanvases[i].id = 'rstats-' + idsuffix;

        var y = (1.25 - i * 0.025) + ' 0';

        // create the image for the rstats canvas
        var stats = document.createElement('a-image');
        stats.setAttribute('position', '-0.08 ' + y);
        stats.setAttribute('width', '0.34');
        stats.setAttribute('height', '0.025');
        stats.setAttribute('src', '#' + rscanvases[i].id);
        self.statspanel.appendChild(stats);

        // create the canvas for the value
        var valuecanvas = document.createElement('canvas');
        valuecanvas.setAttribute('id', 'value-' + idsuffix);
        valuecanvas.setAttribute('width', '160');
        valuecanvas.setAttribute('height', '20');
        valuecanvas.setAttribute('crossorigin', 'anonymous');
        self.valuecanvases.push(valuecanvas);

        // add the value canvas
        self.statsEl.appendChild(self.valuecanvases[i]);

        // create the image for the value canvas
        var value = document.createElement('a-image');
        value.setAttribute('position', '0.17 ' + y);
        value.setAttribute('width', '0.16');
        value.setAttribute('height', '0.025');
        value.setAttribute('src', '#' + self.valuecanvases[i].id);
        self.statspanel.appendChild(value);
      }
    }, 0);
  },

  update: function () {
    if (!this.stats) { return; }
    return (!this.data) ? this.hide() : this.show();
  },

  remove: function () {
    this.statsEl.parentNode.removeChild(this.statsEl);
  },

  tick: function () {
    var stats = this.stats;

    if (!stats) { return; }

    stats('rAF').tick();
    stats('FPS').frame();
    stats().update();

    // periodically update the value canvases
    var now = Date.now();
    if (now < this.lastTime + 500) { return; }

    this.lastTime = now;
    if (this.valuecanvases) {
      for (var i = 0; i < this.valuecanvases.length; i++) {
        var ctx = this.valuecanvases[i].getContext('2d');
        ctx.font = '16px monospace';
        ctx.fillStyle = 'gray';
        ctx.fillRect(0, 0, 160, 20);
        ctx.fillStyle = 'black';
        ctx.fillText(this.rsvalues[i].innerText + ' ' + this.rsids[i], 2, 16);
      }
    }
  },

  hide: function () {
    if (this.statspanel) { this.statspanel.object3D.visible = false; }
  },

  show: function () {
    if (this.statspanel) { this.statspanel.object3D.visible = true; }
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
