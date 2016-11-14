var debug = require('../../utils/debug');
var registerComponent = require('../../core/component').registerComponent;

var warn = debug('components:pool:warn');

/**
 * Pool component.
 * A pool of entities that will be reused.
 * It avoids creating and destroying the same kind of entities
 * in dynamic scenes. It will help reduce GC pauses. Useful for example
 * in a game where you want to reuse enemies entities.
 *
 * @member {array} availableEls - Available entities in the pool.
 * @member {array} usedEls - Entities of the pool in use.
 *
 */
module.exports.Component = registerComponent('pool', {
  schema: {
    mixin: {default: ''},
    size: {default: 0},
    dynamic: {default: false}
  },

  multiple: true,

  init: function () {
    this.initPool();
  },

  initPool: function () {
    var i;
    var mixin = this.data.mixin;
    if (!mixin) { return; }
    this.availableEls = [];
    this.usedEls = [];
    for (i = 0; i < this.data.size; ++i) {
      this.createEntity();
    }
  },

  update: function (oldData) {
    var data = this.data;
    if (oldData.mixin !== data.mixin || oldData.size !== data.size) {
      this.initPool();
    }
  },

  /**
   * Add a new entity to the list of available entities.
   */
  createEntity: function () {
    var el = document.createElement('a-entity');
    el.play = this.wrapPlay(el.play);
    el.setAttribute('mixin', this.data.mixin);
    el.setAttribute('visible', false);
    this.el.appendChild(el);
    this.availableEls.push(el);
  },

  /**
   * Play wrapper for pooled entities. When pausing and playing
   * a scene we don't want to play the entities that are not in use
   */
  wrapPlay: function (playMethod) {
    var usedEls = this.usedEls;
    return function () {
      if (usedEls.indexOf(this) === -1) { return; }
      playMethod.call(this);
    };
  },

  /**
   * Used to request one of the available entities of the pool
   */
  requestEntity: function () {
    var el;
    if (this.availableEls.length === 0) {
      if (this.data.dynamic === false) {
        warn('Requested entity from empty pool ' + this.name);
        return;
      } else {
        warn('Requested entity from empty pool. This pool is dynamic' +
        'and will resize automatically. You might want to increase its initial size' + this.name);
      }
      this.createEntity();
    }
    el = this.availableEls.shift();
    this.usedEls.push(el);
    el.setAttribute('visible', true);
    return el;
  },

  /**
   * Used to return a used entity to the pool
   */
  returnEntity: function (el) {
    var index = this.usedEls.indexOf(el);
    if (index === -1) {
      warn('The returned entity was not previously pooled from ' + this.name);
      return;
    }
    this.usedEls.splice(index, 1);
    this.availableEls.push(el);
    el.setAttribute('visible', false);
    el.pause();
  }
});
