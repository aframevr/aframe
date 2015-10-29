/* global HTMLElement */

var VRMarkup = require('@mozvr/vr-markup');
var utils = require('../lib/utils');

var registerElement = VRMarkup.registerElement.registerElement;

// Synthesize events for cursor `mouseenter` and `mouseleave`.
window.addEventListener('stateadded', function (e) {
  var detail = e.detail;
  if (detail.state === 'hovering') {
    e.target.emit('mouseenter');
  }
});
window.addEventListener('stateremoved', function (e) {
  var detail = e.detail;
  if (detail.state === 'hovering') {
    e.target.emit('mouseleave');
  }
});

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
            this.listeners = {};
            this.attachEventListener();
          },
          writable: window.debug
        },

        detachedCallback: {
          value: function () {
            // Remove all event listeners.
            Object.keys(this.listeners).forEach(function (key) {
              this.detachEventListener(this.listeners[key]);
            }, this);
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
            if (!self.parentNode) { return; }

            var target = self.target || self.parentNode;
            utils.$$(target).forEach(addEventListener);

            function addEventListener (targetEl) {
              self.detachEventListener(targetEl);

              var listenerFunc = self.updateTargetElAttributes(targetEl);
              self.listeners[targetEl] = listenerFunc;
              self.parentNode.addEventListener(self.type, listenerFunc);
            }
          },
          writable: window.debug
        },

        detachEventListener: {
          value: function (targetEl) {
            if (!this.type) { return; }

            var oldListenerFunc = this.listeners[targetEl];
            if (!oldListenerFunc) { return; }

            this.parentNode.removeEventListener(this.type, oldListenerFunc);
            delete this.listeners[targetEl];
          },
          writable: window.debug
        },

        updateTargetElAttributes: {
          value: function (targetEl) {
            var self = this;
            return function () {
              utils.$$(self.attributes).forEach(function (attr) {
                if (attr.name in self.attributeBlacklist) { return; }
                // TODO: Handle removing unique attributes
                // (e.g., `class`, `id`, `name`, etc.).
                targetEl.setAttribute(attr.name, attr.value);
              });
            };
          },
          writable: window.debug
        }
      }
    )
  }
);
