var DEFAULT_HANDEDNESS = require('../constants').DEFAULT_HANDEDNESS;
var AXIS_LABELS = ['x', 'y', 'z', 'w'];
var NUM_HANDS = 2; // Number of hands in a pair. Should always be 2.

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
  var filterControllerIndex = queryObject.index || 0;

  if (!idPrefix) { return false; }

  trackedControlsSystem = sceneEl && sceneEl.systems['tracked-controls'];
  if (!trackedControlsSystem) { return false; }

  gamepads = trackedControlsSystem.controllers;
  if (!gamepads.length) { return false; }

  return !!findMatchingController(gamepads, null, idPrefix, queryObject.hand, filterControllerIndex);
}

module.exports.isControllerPresent = isControllerPresent;

/**
 * Walk through the given controllers to find any where the device ID equals filterIdExact, or startWith filterIdPrefix.
 * A controller where this considered true is considered a 'match'.
 *
 * For each matching controller:
 *   If filterHand is set, and the controller:
 *     is handed, we further verify that controller.hand equals filterHand.
 *     is unhanded (controller.hand is ''), we skip until we have found a number of matching controllers that equals filterControllerIndex
 *   If filterHand is not set, we skip until we have found the nth matching controller, where n equals filterControllerIndex
 *
 * The method should be called with one of: [filterIdExact, filterIdPrefix] AND one or both of: [filterHand, filterControllerIndex]
 *
 * @param {object} controllers - Array of gamepads to search
 * @param {string} filterIdExact - If set, used to find controllers with id === this value
 * @param {string} filterIdPrefix - If set, used to find controllers with id startsWith this value
 * @param {object} filterHand - If set, further filters controllers with matching 'hand' property
 * @param {object} filterControllerIndex - Find the nth matching controller, where n equals filterControllerIndex. defaults to 0.
 */
function findMatchingController (controllers, filterIdExact, filterIdPrefix, filterHand, filterControllerIndex) {
  var controller;
  var i;
  var matchingControllerOccurence = 0;
  var targetControllerMatch = filterControllerIndex || 0;

  for (i = 0; i < controllers.length; i++) {
    controller = controllers[i];
    // Determine if the controller ID matches our criteria
    if (filterIdPrefix && controller.id.indexOf(filterIdPrefix) === -1) { continue; }
    if (!filterIdPrefix && controller.id !== filterIdExact) { continue; }

    // If the hand filter and controller handedness are defined we compare them.
    if (filterHand && controller.hand && filterHand !== controller.hand) { continue; }

    // If we have detected an unhanded controller and the component was asking for a particular hand,
    // we need to treat the controllers in the array as pairs of controllers. This effectively means that we
    // need to skip NUM_HANDS matches for each controller number, instead of 1.
    if (filterHand && !controller.hand) {
      targetControllerMatch = NUM_HANDS * filterControllerIndex + ((filterHand === DEFAULT_HANDEDNESS) ? 0 : 1);
    }

    // We are looking for the nth occurence of a matching controller (n equals targetControllerMatch).
    if (matchingControllerOccurence === targetControllerMatch) {
      return controller;
    }
    ++matchingControllerOccurence;
  }
  return undefined;
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
