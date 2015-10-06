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
            this.sceneEl = sceneEl;
            this.updateMixin();
          },
          writable: window.debug
        },

        detachedCallback: {
          value: function () { /* no-op */ },
          writable: window.debug
        },

        attributeChangedCallback: {
          value: function (attr) {
            if (attr !== 'mixin') { return; }
            this.updateMixin();
          },
          writable: window.debug
        },

        updateMixin: {
          value: function () {
            var mixinId = this.getAttribute('mixin');
            this.mixinEl = document.querySelector('#' + mixinId);
            // Listens to changes on the mixin if there's any
            this.attachMixinListener(this.mixinEl);
          }
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

        mixinChanged: {
          value: function (newMixin, oldMixin) {
            if (oldMixin) { this.removeMixinListener(oldMixin); }
            this.attachMixinListener(newMixin);
          },
          writable: window.debug
        },

        removeMixinListener: {
          value: function () {
            var observer = this.mixinObserver;
            if (!observer) { return; }
            observer.disconnect();
            this.mixinObserver = null;
          },
          writable: window.debug
        },

        attachMixinListener: {
          value: function (mixinEl) {
            var self = this;
            var currentObserver = this.mixinObserver;
            if (!mixinEl) { return; }
            if (currentObserver) { currentObserver.disconnect(); }
            var observer = new MutationObserver(function (mutations) {
              var attr = mutations[0].attributeName;
              self.applyMixin(attr);
            });
            var config = { attributes: true };
            observer.observe(mixinEl, config);
            this.mixinObserver = observer;
          },
          writable: window.debug
        },

        applyMixin: {
          value: function () { /* no-op */ },
          writable: window.debug
        }
      })
  }
);
