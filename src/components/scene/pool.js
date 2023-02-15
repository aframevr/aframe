var debug = require('../../utils/debug');
var registerComponent = require('../../core/component').registerComponent;

var warn = debug('components:pool:warn');

/**
 * Pool component to reuse entities.
 * Avoids creating and destroying the same kind of entities.
 * Helps reduce GC pauses. For example in a game to reuse enemies entities.
 *
 * @member {array} availableEls - Available entities in the pool.
 * @member {array} usedEls - Entities of the pool in use.
 */
module.exports.Component = registerComponent('pool', {
  schema: {
    container: {default: ''},
    mixin: {default: ''},
    size: {default: 0},
    dynamic: {default: false}
  },

  multiple: true,

  initPool: function () {
    var i;

    this.availableEls = [];
    this.usedEls = [];

    if (!this.data.mixin) {
      warn('No mixin provided for pool component.');
    }

    if (this.data.container) {
      this.container = document.querySelector(this.data.container);
      if (!this.container) {
        warn('Container ' + this.data.container + ' not found.');
      }
    }
    this.container = this.container || this.el;

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
    var el;
    el = document.createElement('a-entity');
    el.play = this.wrapPlay(el.play);
    el.setAttribute('mixin', this.data.mixin);
    el.object3D.visible = false;
    el.pause();
    this.container.appendChild(el);
    this.availableEls.push(el);

    var usedEls = this.usedEls;
    el.addEventListener('loaded', function () {
      if (usedEls.indexOf(el) !== -1) { return; }
      el.object3DParent = el.object3D.parent;
      el.object3D.parent.remove(el.object3D);
    });
  },

  /**
   * Play wrapper for pooled entities. When pausing and playing a scene, don't want to play
   * entities that are not in use.
   */
  wrapPlay: function (playMethod) {
    var usedEls = this.usedEls;
    return function () {
      if (usedEls.indexOf(this) === -1) { return; }
      playMethod.call(this);
    };
  },

  /**
   * Used to request one of the available entities of the pool.
   */
  requestEntity: function () {
    var el;
    if (this.availableEls.length === 0) {
      if (this.data.dynamic === false) {
        warn('Requested entity from empty pool: ' + this.attrName);
        return;
      } else {
        warn('Requested entity from empty pool. This pool is dynamic and will resize ' +
             'automatically. You might want to increase its initial size: ' + this.attrName);
      }
      this.createEntity();
    }
    el = this.availableEls.shift();
    this.usedEls.push(el);
    if (el.object3DParent) {
      el.object3DParent.add(el.object3D);
      this.updateRaycasters();
    }
    el.object3D.visible = true;
    return el;
  },

  /**
   * Used to return a used entity to the pool.
   */
  returnEntity: function (el) {
    var index = this.usedEls.indexOf(el);
    if (index === -1) {
      warn('The returned entity was not previously pooled from ' + this.attrName);
      return;
    }
    this.usedEls.splice(index, 1);
    this.availableEls.push(el);
    el.object3DParent = el.object3D.parent;
    el.object3D.parent.remove(el.object3D);
    this.updateRaycasters();
    el.object3D.visible = false;
    el.pause();
    return el;
  },

  updateRaycasters () {
    var raycasterEls = document.querySelectorAll('[raycaster]');

    raycasterEls.forEach(function (el) {
      el.components['raycaster'].setDirty();
    });
  }
});
