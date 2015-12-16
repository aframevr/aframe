/* global HTMLElement */
var AComponents = require('./component').components;
var ANode = require('./a-node');
var registerElement = require('./a-register-element').registerElement;

module.exports = registerElement(
  'a-mixin',
  {
    prototype: Object.create(
      ANode.prototype,
      {
        attachedCallback: {
          value: function () {
            this.load();
          },
          writable: window.debug
        },

        setAttribute: {
          value: function (attr, value) {
            var component = AComponents[attr];
            if (component && typeof value === 'object') {
              value = component.stringify(value);
            }
            HTMLElement.prototype.setAttribute.call(this, attr, value);
          },
          writable: window.debug
        },

        getAttribute: {
          value: function (attr) {
            var component = AComponents[attr];
            var value = HTMLElement.prototype.getAttribute.call(this, attr);
            if (!component || typeof value !== 'string') { return value; }
            return component.parse(value);
          },
          writable: window.debug
        }
      }
    )
  }
);
