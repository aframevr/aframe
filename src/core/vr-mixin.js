/* global HTMLElement */
var registerElement = require('../vr-register-element');

var VRComponents = require('./components').components;
var VRNode = require('./vr-node');

module.exports = registerElement(
  'vr-mixin',
  {
    prototype: Object.create(
      VRNode.prototype,
      {
        attachedCallback: {
          value: function () {
            this.load();
          },
          writable: window.debug
        },

        setAttribute: {
          value: function (attr, value) {
            var component = VRComponents[attr];
            if (component && typeof value === 'object') {
              value = component.stringifyAttributes(value);
            }
            HTMLElement.prototype.setAttribute.call(this, attr, value);
          },
          writable: window.debug
        },

        getAttribute: {
          value: function (attr) {
            var component = VRComponents[attr];
            var value = HTMLElement.prototype.getAttribute.call(this, attr);
            if (!component || typeof value !== 'string') { return value; }
            return component.parseAttributesString(value);
          },
          writable: window.debug
        }
      }
    )
  }
);
