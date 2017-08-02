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
  var gamepads;
  var sceneEl = component.el.sceneEl;
  var trackedControlsSystem;
  var targetControllerNumber;

  if (!idPrefix) { return false; }

  if (queryObject.hand) {
    // This is only used in the case where the gamepads themselves are not handed
    targetControllerNumber = (queryObject.hand === DEFAULT_HANDEDNESS) ? 0 : 1;
  } else {
    targetControllerNumber = queryObject.index || 0;
  }

  trackedControlsSystem = sceneEl && sceneEl.systems['tracked-controls'];
  if (!trackedControlsSystem) { return false; }

  gamepads = trackedControlsSystem.controllers;
  if (!gamepads.length) { return false; }

  return !!findMatchingController(gamepads, null, idPrefix, queryObject.hand, targetControllerNumber);
}

module.exports.isControllerPresent = isControllerPresent;

/**
 * Walk through the given controllers to find any where the device ID equals filterIdExact, or startWith filterIdPrefix.
 * A controller where this considered true is considered a 'match'.
 *
 * For each matching controller:
 *   If filterHand is set, and the controller:
 *     is handed, we further verify that controller.hand equals filterHand.
 *     is unhanded (controller.hand is ''), we skip until we have found a number of matching controllers that equals targetControllerNumber
 *   If filterHand is not set, we skip until we have found the nth matching controller, where n equals targetControllerNumber
 *
 * The method should be called with one of: [filterIdExact, filterIdPrefix] AND one or both of: [filterHand, targetControllerNumber]
 *
 * @param {object} controllers - Array of gamepads to search
 * @param {string} filterIdExact - If set, used to find controllers with id === this value
 * @param {string} filterIdPrefix - If set, used to find controllers with id startsWith this value
 * @param {object} filterHand - If set, further filters controllers with matching 'hand' property
 * @param {object} targetControllerNumber - Find the nth matching controller, where n equals targetControllerNumber. defaults to 0.
 */
function findMatchingController (controllers, filterIdExact, filterIdPrefix, filterHand, targetControllerNumber) {
  var controller;
  var i;
  var matchingControllerOccurence = 0;
  targetControllerNumber = targetControllerNumber || 0;

  for (i = 0; i < controllers.length; i++) {
    controller = controllers[i];
    // Determine if the controller ID matches our criteria
    if (filterIdPrefix && controller.id.indexOf(filterIdPrefix) === -1) continue;
    if (!filterIdPrefix && controller.id !== filterIdExact) continue;

    if (filterHand) {
      if (filterHand === controller.hand) {
        // If the component requests a specific hand and found a matching one, we ignore the
        // targetControllerNumber requirement and early exit.
        return controller;
      } else if (controller.hand) {
        continue;
      }
      // If we reach here, the controller is unhanded - check against targetControllerNumber
    }
    // The controller is unhanded, or we are looking for the nth occurence of a matching controller (n equals targetControllerNumber).
    if (matchingControllerOccurence === targetControllerNumber) {
      return controller;
    }
    ++matchingControllerOccurence;
  }
  return null;
}

module.exports.findMatchingController = findMatchingController;

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
      if (evt.detail.changed[axes[j]]) { changed = true; }
    }

    if (!changed) { continue; }

    // Axis has changed. Emit the specific moved event with axis values in detail.
    detail = {};
    for (j = 0; j < axes.length; j++) {
      detail[AXIS_LABELS[j]] = evt.detail.axis[axes[j]];
    }
    component.el.emit(buttonTypes[i] + 'moved', detail);
  }
};
