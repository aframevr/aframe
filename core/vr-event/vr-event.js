/* global HTMLElement */

var VRMarkup = require('@mozvr/vr-markup');
var utils = require('../lib/utils');

var registerElement = VRMarkup.registerElement.registerElement;
var stateEls = {};
var listeners = {};
var targetData = {};

var attributeBlacklist = {
  // TODO: Consider ignoring unique attributes too
  // (e.g., `class`, `id`, `name`, etc.).
  target: true
};

// State management

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
  if (!(state in stateEls)) { return false; }
  var elIdx = stateEls[state].indexOf(el);
  return elIdx !== -1;
}

// Unique event listeners

function recordListener (el, type) {
  if (type in listeners) {
    listeners[type].push(el);
  } else {
    listeners[type] = [el];
  }
}

function hasListener (el, type) {
  if (!(type in listeners)) { return false; }
  var elIdx = listeners[type].indexOf(el);
  return elIdx !== -1;
}

function addDelegatedListener (el, type, listener, useCapture) {
  if (hasListener(el, type)) { return; }  // Add the event listener only once.
  recordListener(el, type);
  el.addEventListener(type, listener, useCapture);
}

// Target data

function recordTargetData (type, sourceEl, targetSel, attributes) {
  var key = type;
  var obj = {sourceEl: sourceEl, targetSel: targetSel, attributes: attributes};
  if (key in targetData) {
    targetData[key].push(obj);
  } else {
    targetData[key] = [obj];
  }
}

function getTargetData (type) {
  var key = type;
  return targetData[key];
}

function targetListener (e) {
  // Not to be confused with the `target` we are modifying below.
  var eventFiredOnEl = e.target;
  var eventType = e.type;

  var allTargetData = getTargetData(eventType, eventFiredOnEl);
  if (!allTargetData) { return; }

  allTargetData.forEach(updateTargetEl);

  function updateTargetEl (targetData) {
    var sourceEl = targetData.sourceEl;
    if (sourceEl !== eventFiredOnEl) { return; }

    var targetAttributes = targetData.attributes;
    // TODO: Support updating multiple elements later by using `$$` and iterating.
    var targetSel = targetData.targetSel;
    var targetEl = typeof targetSel === 'string' ? utils.$(targetSel) : targetSel;

    if (!targetEl) { return; }

    updateAttrs(targetEl, targetAttributes);
  }
}

function updateAttrs (targetEl, targetAttributes) {
  utils.$$(targetAttributes).forEach(function (attr) {
    if (attr.name in attributeBlacklist) { return; }

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
}

// Synthesize events for cursor `mouseenter` and `mouseleave`

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
  // if (el.root) {
  //   return el.root;
  // }
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
            this.sceneEl = utils.$('vr-scene');
            this.attachEventListener();
          },
          writable: window.debug
        },

        detachedCallback: {
          value: function () {
            // TODO: Remove all event listeners.
          },
          writable: window.debug
        },

        attributeChangedCallback: {
          value: function (attr, oldVal, newVal) {
            if (oldVal === newVal) { return; }
            if (attr === 'type') {
              this.type = newVal;
            } else if (attr === 'target') {
              this.target = newVal;
            }
          },
          writable: window.debug
        },

        attachEventListener: {
          value: function () {
            var self = this;

            // TODO: Land `on` PR in `aframe-core`: https://github.com/MozVR/aframe-core/pull/330

            this.sceneEl = this.sceneEl || utils.$('vr-scene');

            if (self.type === 'load') {
              var sourceEl = getRealNode(self.parentNode);
              var targetEl = self.target ? utils.$(self.target) : getRealNode(self.parentNode);
              var listener = function (e) {
                if (e.target !== sourceEl) { return; }
                updateAttrs(targetEl, self.attributes);
              };
              if (sourceEl && sourceEl.hasLoaded) {
                listener();
                return;
              }
              this.sceneEl.addEventListener('load', listener);
              return;
            }

            // We must delegate events because the target nodes may not exist yet.
            addDelegatedListener(this.sceneEl, self.type, targetListener);
            recordTargetData(self.type, getRealNode(self.parentNode), self.target || self.parentNode, self.attributes);
          },
          writable: window.debug
        }
      }
    )
  }
);

module.exports = VREvent;
