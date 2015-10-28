/* global HTMLElement */

var VRMarkup = require('@mozvr/vr-markup');
var utils = require('../lib/utils');

var registerElement = VRMarkup.registerElement.registerElement;

module.exports = registerElement(
  'vr-event',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        attachedCallback: {
          value: function () {
            this.type = this.type || this.getAttribute('type');
            this.target = this.getAttribute('target');
            this.attachEventListener();
          },
          writable: window.debug
        },

        detachedCallback: {
          value: function () {
            // TODO: Remove event listener.
          },
          writable: window.debug
        },

        attributeChangedCallback: {
          value: function (attr, oldVal, newVal) {
            if (attr === 'type') {
              this.type = newVal;
            } else if (attr === 'target') {
              this.target = newVal;
            } else {
              return;
            }
            if (oldVal === newVal) { return; }
            this.attachEventListener();
          },
          writable: window.debug
        },

        attributeBlacklist: {
          value: {
            target: true
          },
          writable: window.debug
        },

        attachEventListener: {
          value: function () {
            var self = this;
            self.parentNode.removeEventListener(self.type, updateAttrs);
            if (!self.parentNode) { return; }
            var target = self.target || self.parentNode;
            utils.$$(target).forEach(addEventListener);
            function addEventListener (targetEl) {
              self.parentNode.addEventListener(self.type, updateAttrs.bind(targetEl));
            }
            function updateAttrs () {
              var el = this;
              utils.$$(self.attributes).forEach(function (attr) {
                if (attr.name in self.attributeBlacklist) { return; }
                el.setAttribute(attr.name, attr.value);
              });
            }
          },
          writable: window.debug
        }
      }
    )
  }
);
