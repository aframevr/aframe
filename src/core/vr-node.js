/* global Event, HTMLElement */

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

        createdCallback: {
          value: function () {
            var sceneEl = document.querySelector('vr-scene');
            this.sceneEl = sceneEl;
          },
          writable: window.debug
        },

        attachedCallback: {
          value: function () { /* no-op */ },
          writable: window.debug
        },

        detachedCallback: {
          value: function () { /* no-op */ },
          writable: window.debug
        },

        attributeChangedCallback: {
          value: function () { /* no-op */ },
          writable: window.debug
        },

        load: {
          value: function () {
            // To prevent emmitting the loaded event more than once
            if (this.hasLoaded) { return; }
            var attributeChangedCallback = this.attributeChangedCallback;
            var event = new Event('loaded');
            this.hasLoaded = true;
            this.dispatchEvent(event);
            if (attributeChangedCallback) { attributeChangedCallback.apply(this); }
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
        }
      })
  }
);
