/* global Event, HTMLElement, MutationObserver */
require('../vr-register-element');

var VRUtils = require('../vr-utils');

/**
 *
 * VRNode is the base class for all the VR markup
 * It manages loading of objects.
 *
 */

module.exports = document.registerElement(
  'vr-node',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {

        //  ----------------------------------  //
        //   Native custom elements callbacks   //
        //  ----------------------------------  //

        attachedCallback: {
          value: function () {
            var sceneEl = document.querySelector('vr-scene');
            var mixins = this.getAttribute('mixin');
            this.sceneEl = sceneEl;
            this.mixinEls = [];
            this.mixinObservers = {};
            if (mixins) { this.updateMixins(mixins); }
          },
          writable: window.debug
        },

        detachedCallback: {
          value: function () { /* no-op */ },
          writable: window.debug
        },

        attributeChangedCallback: {
          value: function (attr, oldVal, newVal) {
            // In Firefox the callback is called even if the
            // attribute value doesn't change. We return
            // if old and new values are the same
            var newValStr = VRUtils.stringifyAttributeValue(newVal);
            if (oldVal === newValStr) { return; }
            if (attr !== 'mixin') { return; }
            this.updateMixins(newVal, oldVal);
          },
          writable: window.debug
        },

        load: {
          value: function () {
            // To prevent emmitting the loaded event more than once
            if (this.hasLoaded) { return; }
            var event = new Event('loaded');
            this.hasLoaded = true;
            this.dispatchEvent(event);
          },
          writable: window.debug
        },

        setAttribute: {
          value: function (attr, value) {
            value = VRUtils.stringifyAttributeValue(value);
            HTMLElement.prototype.setAttribute.call(this, attr, value);
          },
          writable: window.debug
        },

        getAttribute: {
          value: function (attr, defaultValue) {
            var value = HTMLElement.prototype.getAttribute.call(this, attr);
            return VRUtils.parseAttributeString(attr, value, defaultValue);
          },
          writable: window.debug
        },

        updateMixins: {
          value: function (newMixins, oldMixins) {
            var newMixinsIds = newMixins.split(' ');
            var oldMixinsIds = oldMixins ? oldMixins.split(' ') : [];
            // To determine what listeners will be removed
            var diff = oldMixinsIds.filter(function (i) { return newMixinsIds.indexOf(i) < 0; });
            this.mixinEls = [];
            diff.forEach(this.removeMixin.bind(this));
            newMixinsIds.forEach(this.addMixin.bind(this));
          },
          writable: window.debug
        },

        addMixin: {
          value: function (mixinId) {
            var mixinEl = document.querySelector('#' + mixinId);
            if (!mixinEl) { return; }
            this.attachMixinListener(mixinEl);
            this.mixinEls.push(mixinEl);
          }
        },

        removeMixin: {
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
          },
          writable: window.debug
        },

        removeMixinListener: {
          value: function (mixinId) {
            var observer = this.mixinObservers[mixinId];
            if (!observer) { return; }
            observer.disconnect();
            this.mixinObservers[mixinId] = null;
          },
          writable: window.debug
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
          },
          writable: window.debug
        },

        applyMixin: {
          value: function () { /* no-op */ },
          writable: window.debug
        },

        /**
         * Emits a DOM event.
         *
         * @param {String} name
         *   Name of event (use a space-delimited string for multiple events).
         * @param {Object} detail
         *   Custom data (optional) to pass as `detail` if the event is to
         *   be a `CustomEvent`.
         */
        emit: {
          value: function (name, detail) {
            var self = this;
            return name.split(' ').map(function (eventName) {
              return VRUtils.fireEvent(self, eventName, detail);
            });
          },
          writable: window.debug
        },

        /**
         * Returns a closure that emits a DOM event.
         *
         * @param {String} name
         *   Name of event (use a space-delimited string for multiple events).
         * @param {Object} detail
         *   Custom data (optional) to pass as `detail` if the event is to
         *   be a `CustomEvent`.
         */
        emitter: {
          value: function (name, detail) {
            var self = this;
            return function () {
              self.emit(name, detail);
            };
          },
          writable: window.debug
        }
      })
  }
);
