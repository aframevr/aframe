var debug = require('../../utils/debug');
var register = require('../../core/component').registerComponent;

var warn = debug('components:pool:warn');

module.exports.Component = register('pool', {
  schema: {
    mixin: {default: ''},
    size: {default: 0},
    dynamic: {default: false}
  },

  multiple: true,

  init: function () {
    this.createEntities();
  },

  createEntities: function () {
    var mixin = this.data.mixin;
    if (!mixin) { return; }
    this.pool = [];
    this.pooledEls = [];
    for (var i = 0; i < this.data.size; ++i) {
      this.createEntity();
    }
  },

  createEntity: function () {
    var el = document.createElement('a-entity');
    el.play = this.wrapPlay(el.play);
    el.setAttribute('mixin', this.data.mixin);
    el.setAttribute('visible', false);
    this.el.appendChild(el);
    this.pool.push(el);
  },

  wrapPlay: function (playMethod) {
    var pooledEls = this.pooledEls;
    return function () {
      if (pooledEls.indexOf(this) === -1) { return; }
      playMethod.call(this);
    };
  },

  requestEntity: function () {
    var el;
    if (this.pool.length === 0) {
      if (this.data.dynamic === false) {
        warn('Requested entity from empty pool ' + this.name);
        return;
      }
      this.createEntity();
    }
    el = this.pool.shift();
    this.pooledEls.push(el);
    el.setAttribute('visible', true);
    return el;
  },

  returnEntity: function (el) {
    var index = this.pooledEls.indexOf(el);
    if (index === -1) {
      warn('The returned entity was not previously pooled from ' + this.name);
      return;
    }
    this.pooledEls.splice(index, 1);
    this.pool.push(el);
    el.setAttribute('visible', false);
    el.pause();
  }
});
