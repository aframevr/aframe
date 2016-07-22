/* global HTMLElement, MutationObserver */
var registerElement = require('./a-register-element').registerElement;
var utils = require('../utils/');

/**
 * Base class for A-Frame that manages loading of objects.
 *
 * Nodes can be modified using mixins.
 * Nodes emit a `loaded` event when they and their children have initialized.
 */
module.exports = registerElement('a-node', {
  prototype: Object.create(HTMLElement.prototype, {
    createdCallback: {
      value: function () {
        this.hasLoaded = false;
        this.isNode = true;
        this.isNodeReady = false;
        this.mixinEls = [];
        this.mixinObservers = {};
      }
    },

    attachedCallback: {
      value: function () {
        var mixins = this.getAttribute('mixin');
        this.sceneEl = this.isScene ? this : this.closestScene();
        if (mixins) { this.updateMixins(mixins); }
        this.isNodeReady = true;
        this.emit('nodeready', {}, false);
      }
    },

    attributeChangedCallback: {
      value: function (attr, oldVal, newVal) {
        if (attr === 'mixin') { this.updateMixins(newVal, oldVal); }
      }
    },

   /**
    * Returns the first scene by traversing up the tree starting from and
    * including receiver element.
    */
    closestScene: {
      value: function closest () {
        var element = this;
        while (element) {
          if (element.isScene) { break; }
          element = element.parentElement;
        }
        return element;
      }
    },

    /**
     * Returns first element matching a selector by traversing up the tree starting
     * from and including receiver element.
     *
     * @param {string} selector - Selector of element to find.
     */
    closest: {
      value: function closest (selector) {
        var matches = this.matches || this.mozMatchesSelector ||
          this.msMatchesSelector || this.oMatchesSelector || this.webkitMatchesSelector;
        var element = this;
        while (element) {
          if (matches.call(element, selector)) { break; }
          element = element.parentElement;
        }
        return element;
      }
    },

    detachedCallback: {
      value: function () { /* no-op */ }
    },

    /**
     * Wait for children to attacn and load, if any. Once children are finished, then load.
     * Emit `loaded` event and set `hasLoaded`.
     *
     * @param {function} cb - Callback.
     * @param {function} childLoadedFilter - Function that takes element as argument. Will
     *        be used to filter children to wait for `loaded` event.
     * @param {function} childReadyFilter - Function that takes element as argument. Will
     *        be used to filter children to wait for `nodeready` event.
     */
    load: {
      value: function (cb, childLoadedFilter, childReadyFilter) {
        var self = this;

        if (this.hasLoaded) { return; }

        var children = this.getChildren();

        // Default to waiting for all nodes.
        childReadyFilter = childReadyFilter || function (el) { return true; };
        childLoadedFilter = childLoadedFilter || function (el) { return el.isNode; };

        // Create promises to wait for each node to attach.
        var childrenReady = children.filter(childReadyFilter).map(function (child) {
          return new Promise(function waitForReady (resolve) {
            if (child.isNodeReady) { return resolve(); }
            child.addEventListener('nodeready', resolve);
          });
        });

        // Wait for attach.
        Promise.all(childrenReady).then(function waitAllToLoad () {
          // Create promises to wait for each node to load.
          var childrenLoaded = children.filter(childLoadedFilter).map(function (child) {
            return new Promise(function waitForLoaded (resolve) {
              if (child.hasLoaded) { return resolve(); }
              child.addEventListener('loaded', resolve);
            });
          });

          // Wait for load. Then load.
          Promise.all(childrenLoaded).then(function emitLoaded () {
            self.hasLoaded = true;
            if (cb) { cb(); }
            self.emit('loaded', {}, false);
          });
        });
      },
      writable: true
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

    registerMixin: {
      value: function (mixinId) {
        if (!this.sceneEl) { return; }
        var mixinEl = this.sceneEl.querySelector('a-mixin#' + mixinId);
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
