var DEFAULT_HANDEDNESS = require('../constants').DEFAULT_HANDEDNESS;
var AXIS_LABELS = ['x', 'y', 'z', 'w'];

/**
 * Called on controller component `.play` handlers.
 * Check if controller matches parameters and inject tracked-controls component.
 * Handle event listeners.
 * Generate controllerconnected or controllerdisconnected events.
 *
 * @param {object} component - Tracked controls component.
 * @param {object} idPrefix - Prefix to match in gamepad id if any.
 * @param {object} queryObject - Map of values to match.
 */
module.exports.checkControllerPresentAndSetup = function (component, idPrefix, queryObject) {
  var el = component.el;
  var isPresent = isControllerPresent(component, idPrefix, queryObject);

  // If component was previously paused and now playing, re-add event listeners.
  // Handle the event listeners here since this helper method is control of calling
  // `.addEventListeners` and `.removeEventListeners`.
  if (component.controllerPresent && !component.controllerEventsActive) {
    component.addEventListeners();
  }

  // Nothing changed, no need to do anything.
  if (isPresent === component.controllerPresent) { return isPresent; }

  component.controllerPresent = isPresent;

  // Update controller presence.
  if (isPresent) {
    component.injectTrackedControls();
    component.addEventListeners();
    el.emit('controllerconnected', {name: component.name, component: component});
  } else {
    component.removeEventListeners();
    el.emit('controllerdisconnected', {name: component.name, component: component});
  }
};

/**
 * Enumerate controller (that have pose) and check if they match parameters.
 *
 * @param {object} component - Tracked controls component.
 * @param {object} idPrefix - Prefix to match in gamepad id if any.
 * @param {object} queryObject - Map of values to match.
 */
function isControllerPresent (component, idPrefix, queryObject) {
  var gamepad;
  var gamepads;
  var i;
  var index = 0;
  var isPrefixMatch;
  var isPresent = false;
  var sceneEl = component.el.sceneEl;
  var trackedControlsSystem;

  trackedControlsSystem = sceneEl && sceneEl.systems['tracked-controls'];
  if (!trackedControlsSystem) { return false; }

  gamepads = trackedControlsSystem.controllers;
  if (!gamepads.length) { return false; }

  for (i = 0; i < gamepads.length; ++i) {
    gamepad = gamepads[i];
    isPrefixMatch = (!idPrefix || idPrefix === '' || gamepad.id.indexOf(idPrefix) === 0);
    isPresent = isPrefixMatch;
    if (isPresent && queryObject.hand) {
      isPresent = (gamepad.hand || DEFAULT_HANDEDNESS) === queryObject.hand;
    }
    if (isPresent && queryObject.index) {
      // Need to use count of gamepads with idPrefix.
      isPresent = index === queryObject.index;
    }
    if (isPresent) { break; }
    // Update count of gamepads with idPrefix.
    if (isPrefixMatch) { index++; }
  }

  return isPresent;
}

module.exports.isControllerPresent = isControllerPresent;

/**
 * Emit specific `moved` event(s) if axes changed based on original axismoved event.
 *
 * @param {object} component - Controller component in use.
 * @param {array} axesMapping - For example `{thumbstick: [0, 1]}`.
 * @param {object} evt - Event to process.
 */
module.exports.emitIfAxesChanged = function (component, axesMapping, evt) {
  var axes;
  var buttonTypes;
  var changed;
  var detail;
  var i;
  var j;

  buttonTypes = Object.keys(axesMapping);
  for (i = 0; i < buttonTypes.length; i++) {
    axes = axesMapping[buttonTypes[i]];

    changed = false;
    for (j = 0; j < axes.length; j++) {
      if (evt.detail.changed[j]) { changed = true; }
    }

    if (!changed) { continue; }

    // Axis has changed. Emit the specific moved event with axis values in detail.
    detail = {};
    for (j = 0; j < axes.length; j++) {
      detail[AXIS_LABELS[axes[j]]] = evt.detail.axis[axes[j]];
    }
    component.el.emit(buttonTypes[i] + 'moved', detail);
  }
};
