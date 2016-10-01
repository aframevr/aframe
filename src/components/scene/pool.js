var debug = require('../../utils/debug');
var register = require('../../core/component').registerComponent;

var warn = debug('components:pool:warn');

/**
 * Pool component.
 * It initialized a pool of entities that will be reused.
 * It avoids creating and destroying the same kind entities
 * in dynamic scenes. Useful for example in a game where you want
 * to reuse enemies entities
 *
 * @member {array} poolEls - Available entities in the pool.
 * @member {array} pooledEls - Entities of the pool in use.
 *
 */
module.exports.Component = register('pool', {
  schema: {
    mixin: {default: ''},
    size: {default: 0},
    dynamicSize: {default: false}
  },

  multiple: true,

  init: function () {
    this.createEntities();
  },

  createEntities: function () {
    var mixin = this.data.mixin;
    if (!mixin) { return; }
    this.poolEls = [];
    this.pooledEls = [];
    for (var i = 0; i < this.data.size; ++i) {
      this.createEntity();
    }
  },

  update: function (oldData) {
    var data = this.data;
    if (oldData.mixin !== data.mixin || oldData.size !== data.size) {
      this.createEntities();
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
    this.poolEls.push(el);
  },

  /**
   * Play wrapper for pooled entities. When pausing and playing
   * a scene we don't want to play the entities that are not in use
   */
  wrapPlay: function (playMethod) {
    var pooledEls = this.pooledEls;
    return function () {
      if (pooledEls.indexOf(this) === -1) { return; }
      playMethod.call(this);
    };
  },

  /**
   * Used to request one of the available entities of the pool
   */
  requestEntity: function () {
    var el;
    if (this.poolEls.length === 0) {
      if (this.data.dynamicSize === false) {
        warn('Requested entity from empty pool ' + this.name);
        return;
      }
      this.createEntity();
    }
    el = this.poolEls.shift();
    this.pooledEls.push(el);
    el.setAttribute('visible', true);
    return el;
  },

  /**
   * Used to return a used entity to the pool
   */
  returnEntity: function (el) {
    var index = this.pooledEls.indexOf(el);
    if (index === -1) {
      warn('The returned entity was not previously pooled from ' + this.name);
      return;
    }
    this.pooledEls.splice(index, 1);
    this.poolEls.push(el);
    el.setAttribute('visible', false);
    el.pause();
  }
});
