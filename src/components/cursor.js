var registerComponent = require('../core/component').registerComponent;
var utils = require('../utils/');

module.exports.Component = registerComponent('cursor', {
  schema: {
    timeout: { default: 1500, min: 0 },
    maxDistance: { default: 5, min: 0 },
    fuse: { default: false }
  },

  dependencies: [ 'raycaster' ],

  init: function () {
    this.raycaster = this.el.components.raycaster;
    // The cursor defaults to fuse in mobile environments
    this.schema.fuse.default = utils.isMobile();
    this.attachEventListeners();
  },

  attachEventListeners: function () {
    var el = this.el;
    var canvas = el.sceneEl.canvas;

    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

    el.addEventListener('intersection', this.onIntersection.bind(this));
    el.addEventListener('intersectioncleared', this.onIntersectionCleared.bind(this));
  },

  onMouseDown: function (evt) {
    this.emit('mousedown');
    this.mouseDownEl = this.intersectedEl;
  },

  onMouseUp: function () {
    this.emit('mouseup');
    if (this.data.fuse) { return; }
    if (!this.intersectedEl) { return; }
    if (this.mouseDownEl === this.intersectedEl) {
      this.emit('click');
    }
  },

  emit: function (evt) {
    var intersectedEl = this.intersectedEl;
    this.el.emit(evt);
    if (intersectedEl) { intersectedEl.emit(evt); }
  },

  emitter: function (evt) {
    return function () {
      this.emit(evt);
    }.bind(this);
  },

  onIntersection: function (evt) {
    var self = this;
    var data = this.data;
    var el = evt.detail.el;
    var distance = evt.detail.distance;
    if (this.intersectedEl === el) { return; }
    if (distance >= this.data.maxDistance) { return; }
    this.intersectedEl = el;
    el.addState('hovered');
    el.emit('mouseenter');
    this.el.addState('hovering');
    if (data.timeout === 0) { return; }
    if (!data.fuse) { return; }
    this.el.addState('fusing');
    this.fuseTimeout = setTimeout(fuse, data.timeout);
    function fuse () {
      self.el.removeState('fusing');
      self.emit('click');
    }
  },

  onIntersectionCleared: function (evt) {
    var el = evt.detail.el;
    if (!el || !this.intersectedEl) { return; }
    this.intersectedEl = null;
    el.removeState('hovered');
    el.emit('mouseleave');
    this.el.removeState('hovering');
    this.el.removeState('fusing');
    clearTimeout(this.fuseTimeout);
  }
});
