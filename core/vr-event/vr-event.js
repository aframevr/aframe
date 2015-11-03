/* global HTMLElement */

var VRMarkup = require('@mozvr/vr-markup');
var utils = require('../lib/utils');

var registerComponent = VRMarkup.registerComponent.registerComponent;
var registerElement = VRMarkup.registerElement.registerElement;

var proto = {
  defaults: {
    value: false
  },

  update: {
    value: function (a, b, c) {
      console.log('ººº ;;; update selected = ', a, b, c, this.data, this.el);
      if (this.data) {
        this.el.addState('selected');
      } else {
        this.el.removeState('selected');
      }
    }
  },

  parseAttributesString: {
    value: function (attrs) {
      return attrs === 'true';
    }
  },

  stringifyAttributes: {
    value: function (attrs) {
      return attrs.toString();
    }
  }
};

module.exports.Component = registerComponent('selected', proto);




// Synthesize events for cursor `mouseenter` and `mouseleave`.
window.addEventListener('stateadded', function (e) {
  var detail = e.detail;
  if (detail.state === 'hovering') {
    e.target.emit('mouseenter');
  }
  if (detail.state !== 'selected') { return; }
  utils.$$('[selected]').forEach(function (el) {
    if (e.target === el || getRealNode(e.target) === el) { return; }
    if (el.isVREvent) { console.log('º ;;;; el did not match', el); return; }
    var parentEl = getRealNode(el);
    try {
      parentEl.removeState('selected');
    } catch (e) {
      console.log('ººº;;; poop', el, parentEl);
    }
    parentEl.removeAttribute('selected');
  });
});

window.addEventListener('stateremoved', function (e) {
  var detail = e.detail;
  if (detail.state === 'hovering') {
    e.target.emit('mouseleave');
  }
});

function getRealNode (el) {
  if (el.isVREvent) {
    return getRealNode(el);
  }
  var root = el.closest('vr-root');
  return (root || el).parentNode;
}

var VREvent = registerElement(
  'vr-event',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        attachedCallback: {
          value: function () {
            this.isVREvent = true;
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
              var attrsSeen = utils.$$(self.attributes);
              attrsSeen.forEach(function (attr) {
                attrsSeen[attr.name] = true;

                if (attr.name in self.attributeBlacklist) { return; }
                // TODO: Handle removing unique attributes
                // (e.g., `class`, `id`, `name`, etc.).
                targetEl.setAttribute(attr.name, attr.value);

                if (attr.name === 'selected') {
                  var parentEl = getRealNode(self);
                  parentEl.addState('selected');
                  parentEl.setAttribute('selected', 'true');
                }
              });

              if (!('selected' in attrsSeen)) {
                var parentEl = getRealNode(self);
                console.log('ººººº not seen', parentEl);
                parentEl.removeState('selected');
                parentEl.removeAttribute('selected');
              }
            };
          },
          writable: window.debug
        }
      }
    )
  }
);

module.exports = VREvent;
