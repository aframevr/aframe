/* global HTMLElement */

var VRMarkup = require('@mozvr/vr-markup');
var utils = require('../lib/utils');

var registerElement = VRMarkup.registerElement.registerElement;
var stateEls = {};

function addState (el, state) {
  el.addState(state);
  recordState(el, state);
}

function recordState (el, state) {
  if (state in stateEls) {
    stateEls[state].push(el);
  } else {
    stateEls[state] = [el];
  }
}

function unrecordState (el, state) {
  if (!(state in stateEls)) { return; }
  var elIdx = stateEls[state].indexOf(el);
  if (elIdx === -1) { return; }
  stateEls[state].splice(elIdx, 1);
}

function removeState (el, state) {
  el.removeState(state);
  unrecordState(el, state);
}

function hasState (el, state) {
  if (!(state in stateEls)) { return; }
  var elIdx = stateEls[state].indexOf(el);
  return elIdx !== -1;
}

// Synthesize events for cursor `mouseenter` and `mouseleave`.
window.addEventListener('stateadded', function (e) {
  var detail = e.detail;
  var state = detail.state;
  var el = e.target;

  recordState(el, state);

  if (state === 'hovering') {
    el.emit('mouseenter');
  }
  if (state === 'hovered') {
    if (hasState(el, 'selected')) {
      removeState(el, 'hovered');
    }
  }
});

window.addEventListener('stateremoved', function (e) {
  var detail = e.detail;
  var state = detail.state;
  var el = e.target;

  unrecordState(el, state);

  if (state === 'hovering') {
    el.emit('mouseleave');
  }
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

            utils.$$(self.target).forEach(addEventListener);

            function addEventListener (targetEl) {
              // TODO: Land `on` PR in `aframe-core`: https://github.com/MozVR/aframe-core/pull/330
              if (self.type === 'load' && targetEl.hasLoaded) {
                self.updateTargetElAttributes(targetEl)();
                return;
              }

              self.detachEventListener(targetEl);

              console.log('adding event listener for', self.type, targetEl);

              var listenerFunc = self.updateTargetElAttributes(targetEl);
              self.listeners[targetEl] = listenerFunc;
              // targetEl.parentNode.addEventListener('click', function (e) {
              //   console.error('º––received click', e.target, e.detail.target);
              // });
              self.sourceNode = getRealNode(self);
              self.sourceNode.addEventListener(self.type, listenerFunc, true);
              self.attached = true;
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
            return function (e) {
              // if (!e || e.detail.target !== targetEl) { return; }
              console.error('ººººººººººº targetEl', self.type, self);

              utils.$$(self.attributes).forEach(function (attr) {
                if (attr.name in self.attributeBlacklist) { return; }

                if (attr.name === 'state') {
                  var states = utils.splitString(attr.value);
                  states.forEach(function (state) {
                    // Set the state on this element.
                    addState(targetEl, state);
                    // Remove the state on the other element(s).
                    stateEls[state].forEach(function (el) {
                      if (el === targetEl) { return; }  // Don't remove my state!
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
