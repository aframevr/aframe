/* global HTMLElement */

var VRMarkup = require('@mozvr/vr-markup');
var utils = require('../lib/utils');

var registerComponent = VRMarkup.registerComponent.registerComponent;
var registerElement = VRMarkup.registerElement.registerElement;


var stateEls = {};

function addState (el, state) {
  el.addState(state);
  if (state in stateEls) {
    stateEls[state].push(el);
  } else {
    stateEls[state] = [el];
  }
}

function removeState (el, state) {
  console.error('1')
  if (!(state in stateEls)) { return; }
  console.error('2')
  var elIdx = stateEls[state].indexOf(el);
  console.error('3')
  if (elIdx === -1) { return; }
  console.error('4')
  el.removeState(state);
  console.error('5')
  stateEls[state].splice(elIdx, 1);
}

// Synthesize events for cursor `mouseenter` and `mouseleave`.
window.addEventListener('stateadded', function (e) {
  var detail = e.detail;
  if (detail.state === 'hovering') {
    e.target.emit('mouseenter');
  }
  console.log('º stateadded', detail.state, detail.target);
});

window.addEventListener('stateremoved', function (e) {
  var detail = e.detail;
  if (detail.state === 'hovering') {
    e.target.emit('mouseleave');
  }
  // console.log('º stateremoved', detail.state, detail.target);
});

function getRealNode (el) {
  if (el.isVREvent) {
    return getRealNode(el.parentNode);
  }
  if (el.root) {
    return el.root;
  }
  return el;
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
            this.target = this.target || this.getAttribute('target');
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
              // console.log('º setting target', this.target);
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
            // TODO: Consider ignoring unique attributes too
            // (e.g., `class`, `id`, `name`, etc.).
            target: true
          },
          writable: window.debug
        },

        attachEventListener: {
          value: function () {
            var self = this;

            if (!self.target) {
              self.target = getRealNode(self);
            }
            // console.log('target•••••••••••', self, self.target);

            utils.$$(self.target).forEach(addEventListener);

            function addEventListener (targetEl) {
              self.detachEventListener(targetEl);

              if (self.type === 'load' && targetEl.hasLoaded) {
                console.log('º load targetEl.hasLoaded', self.type, targetEl);
                self.updateTargetElAttributes(targetEl)();
                return;
              }

              var listenerFunc = self.updateTargetElAttributes(targetEl);
              self.listeners[targetEl] = listenerFunc;
              targetEl.addEventListener(self.type, listenerFunc);
            }
          },
          writable: window.debug
        },

        detachEventListener: {
          value: function (targetEl) {
            if (!this.type) { return; }

            var oldListenerFunc = this.listeners[targetEl];
            if (!oldListenerFunc) { return; }

            targetEl.removeEventListener(this.type, oldListenerFunc);
            delete this.listeners[targetEl];
          },
          writable: window.debug
        },

        updateTargetElAttributes: {
          value: function (targetEl) {
            var self = this;
            return function () {
              // console.log('ººº FIRED', self.type, self);
              utils.$$(self.attributes).forEach(function (attr) {
                if (attr.name in self.attributeBlacklist) { return; }

                if (attr.name === 'state') {
                  var states = utils.splitString(attr.value);
                  states.forEach(function (state) {
                    // Set the state on this element.
                    addState(targetEl, state);
                    console.log('º adding state', targetEl, state);
                    // Remove the state on the other element(s).
                    stateEls[state].forEach(function (el) {
                      if (el === targetEl) { return; }  // Don't remove my state!
                      console.error('removing state', el, state);
                      removeState(el, state);
                    });
                  });
                } else {
                  targetEl.setAttribute(attr.name, attr.value);
                }
              });
            };
          },
          writable: window.debug
        }
      }
    )
  }
);

module.exports = VREvent;
