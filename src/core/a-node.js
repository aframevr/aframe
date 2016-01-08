/* global HTMLElement, MutationObserver */
var registerElement = require('./a-register-element').registerElement;
var utils = require('../utils/');

/**
 * Base class for A-Frame that manages loading of objects.
 *
 * Nodes can be modified using mixins.
 * Nodes emit a `loaded` event when they and their children have initialized. Which children
 * to wait for can be customized using `loadChildrenFilter`.
 */
module.exports = registerElement('a-node', {
  prototype: Object.create(HTMLElement.prototype, {
    createdCallback: {
      value: function () {
        this.hasLoaded = false;
        this.isNode = true;
        this.mixinEls = [];
        this.mixinObservers = {};
      }
    },

    attachedCallback: {
      value: function () {
        var mixins = this.getAttribute('mixin');

        this.sceneEl = document.querySelector('a-scene');
        this.emit('nodeready', {}, false);
        if (mixins) { this.updateMixins(mixins); }
      }
    },

    attributeChangedCallback: {
      value: function (attr, oldVal, newVal) {
        if (attr === 'mixin') { this.updateMixins(newVal, oldVal); }
      }
    },

    detachedCallback: {
      value: function () { /* no-op */ }
    },

    /**
     * Wait for children to load, if any.
     * Then emit `loaded` event and set `hasLoaded`.
     */
    load: {
      value: function (cb, childFilter) {
        var children;
        var childrenLoaded;
        var self = this;

        if (self.hasLoaded) { return; }

        // Default to waiting for all nodes.
        childFilter = childFilter || function (el) { return el.isNode; };

        // Wait for children to load (if any), then load.
        children = this.getChildren();
        childrenLoaded = children.filter(childFilter).map(function (child) {
          return new Promise(function waitForLoaded (resolve) {
            child.addEventListener('loaded', resolve);
          });
        });

        Promise.all(childrenLoaded).then(function emitLoaded () {
          if (cb) { cb(); }
          self.hasLoaded = true;
          self.emit('loaded', {}, false);
        });
      }
    },

    getChildren: {
      value: function () {
        var children = [];
        for (var i = 0; i < this.children.length; i++) {
          children.push(this.children[i]);
        }
        return children;
      }
    },

    updateMixins: {
      value: function (newMixins, oldMixins) {
        var newMixinsIds = newMixins.split(' ');
        var oldMixinsIds = oldMixins ? oldMixins.split(' ') : [];
        // To determine what listeners will be removed
        var diff = oldMixinsIds.filter(function (i) { return newMixinsIds.indexOf(i) < 0; });
        this.mixinEls = [];
        diff.forEach(this.unregisterMixin.bind(this));
        newMixinsIds.forEach(this.registerMixin.bind(this));
      }
    },

    addMixin: {
      value: function (mixinId) {
        var mixins = this.getAttribute('mixin');
        var mixinIds = mixins.split(' ');
        var i;
        for (i = 0; i < mixinIds.length; ++i) {
          if (mixinIds[i] === mixinId) { return; }
        }
        mixinIds.push(mixinId);
        this.setAttribute('mixin', mixinIds.join(' '));
      }
    },

    removeMixin: {
      value: function (mixinId) {
        var mixins = this.getAttribute('mixin');
        var mixinIds = mixins.split(' ');
        var i;
        for (i = 0; i < mixinIds.length; ++i) {
          if (mixinIds[i] === mixinId) {
            mixinIds.splice(i, 1);
            this.setAttribute('mixin', mixinIds.join(' '));
            return;
          }
        }
      }
    },

    registerMixin: {
      value: function (mixinId) {
        var mixinEl = document.querySelector('a-mixin#' + mixinId);
        if (!mixinEl) { return; }
        this.attachMixinListener(mixinEl);
        this.mixinEls.push(mixinEl);
      }
    },

    setAttribute: {
      value: function (attr, newValue) {
        if (attr === 'mixin') { this.updateMixins(newValue); }
        HTMLElement.prototype.setAttribute.call(this, attr, newValue);
      }
    },

    unregisterMixin: {
      value: function (mixinId) {
        var mixinEls = this.mixinEls;
        var mixinEl;
        var i;
        for (i = 0; i < mixinEls.length; ++i) {
          mixinEl = mixinEls[i];
          if (mixinId === mixinEl.id) {
            mixinEls.splice(i, 1);
            break;
          }
        }
        this.removeMixinListener(mixinId);
      }
    },

    removeMixinListener: {
      value: function (mixinId) {
        var observer = this.mixinObservers[mixinId];
        if (!observer) { return; }
        observer.disconnect();
        this.mixinObservers[mixinId] = null;
      }
    },

    attachMixinListener: {
      value: function (mixinEl) {
        var self = this;
        var mixinId = mixinEl.id;
        var currentObserver = this.mixinObservers[mixinId];
        if (!mixinEl) { return; }
        if (currentObserver) { return; }
        var observer = new MutationObserver(function (mutations) {
          var attr = mutations[0].attributeName;
          self.applyMixin(attr);
        });
        var config = { attributes: true };
        observer.observe(mixinEl, config);
        this.mixinObservers[mixinId] = observer;
      }
    },

    applyMixin: {
      value: function () { /* no-op */ }
    },

    /**
     * Emits a DOM event.
     *
     * @param {String} name
     *   Name of event (use a space-delimited string for multiple events).
     * @param {Object=} [detail={}]
     *   Custom data to pass as `detail` to the event.
     * @param {Boolean=} [bubbles=true]
     *   Whether the event should bubble.
     */
    emit: {
      value: function (name, detail, bubbles) {
        var self = this;
        detail = detail || {};
        if (bubbles === undefined) { bubbles = true; }
        var data = { bubbles: !!bubbles, detail: detail };
        return name.split(' ').map(function (eventName) {
          return utils.fireEvent(self, eventName, data);
        });
      }
    },

    /**
     * Returns a closure that emits a DOM event.
     *
     * @param {String} name
     *   Name of event (use a space-delimited string for multiple events).
     * @param {Object} detail
     *   Custom data (optional) to pass as `detail` if the event is to
     *   be a `CustomEvent`.
     * @param {Boolean} bubbles
     *   Whether the event should be bubble.
     */
    emitter: {
      value: function (name, detail, bubbles) {
        var self = this;
        return function () {
          self.emit(name, detail, bubbles);
        };
      }
    }
  })
});
