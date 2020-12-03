var DEFAULT_HANDEDNESS = require('../constants').DEFAULT_HANDEDNESS;
var AXIS_LABELS = ['x', 'y', 'z', 'w'];
var NUM_HANDS = 2;  // Number of hands in a pair. Should always be 2.

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
  var controller;
  var hasWebXR = el.sceneEl.hasWebXR;
  var isControllerPresent = hasWebXR ? isControllerPresentWebXR : isControllerPresentWebVR;
  var isPresent;

  controller = isControllerPresent(component, idPrefix, queryObject);
  isPresent = !!controller;

  // If component was previously paused and now playing, re-add event listeners.
  // Handle the event listeners here since this helper method is control of calling
  // `.addEventListeners` and `.removeEventListeners`.
  if (component.controllerPresent && !component.controllerEventsActive && !hasWebXR) {
    component.addEventListeners();
  }

  // Nothing changed, no need to do anything.
  if (isPresent === component.controllerPresent) { return isPresent; }

  component.controllerPresent = isPresent;

  // Update controller presence.
  if (isPresent) {
    component.addEventListeners();
    component.injectTrackedControls(controller);
    el.emit('controllerconnected', {name: component.name, component: component});
  } else {
    component.removeEventListeners();
    el.emit('controllerdisconnected', {name: component.name, component: component});
  }
};

/**
 * Enumerate controller (that have pose) and check if they match parameters for WebVR
 *
 * @param {object} component - Tracked controls component.
 * @param {object} idPrefix - Prefix to match in gamepad id if any.
 * @param {object} queryObject - Map of values to match.
 */
function isControllerPresentWebVR (component, idPrefix, queryObject) {
  var gamepads;
  var sceneEl = component.el.sceneEl;
  var trackedControlsSystem;
  var filterControllerIndex = queryObject.index || 0;

  if (!idPrefix) { return false; }

  trackedControlsSystem = sceneEl && sceneEl.systems['tracked-controls-webvr'];
  if (!trackedControlsSystem) { return false; }

  gamepads = trackedControlsSystem.controllers;
  if (!gamepads.length) { return false; }

  return !!findMatchingControllerWebVR(gamepads, null, idPrefix, queryObject.hand,
                                  filterControllerIndex);
}

/**
 *
 * @param {object} component - Tracked controls component.
 */
function isControllerPresentWebXR (component, id, queryObject) {
  var controllers;
  var sceneEl = component.el.sceneEl;
  var trackedControlsSystem = sceneEl && sceneEl.systems['tracked-controls-webxr'];
  if (!trackedControlsSystem) { return false; }

  controllers = trackedControlsSystem.controllers;
  if (!controllers || !controllers.length) { return false; }

  return findMatchingControllerWebXR(
    controllers, id,
    queryObject.hand, queryObject.index, queryObject.iterateControllerProfiles, queryObject.handTracking);
}

module.exports.isControllerPresentWebVR = isControllerPresentWebVR;
module.exports.isControllerPresentWebXR = isControllerPresentWebXR;

/**
 * Walk through the given controllers to find any where the device ID equals
 * filterIdExact, or startsWith filterIdPrefix.
 * A controller where this considered true is considered a 'match'.
 *
 * For each matching controller:
 *   If filterHand is set, and the controller:
 *     is handed, we further verify that controller.hand equals filterHand.
 *     is unhanded (controller.hand is ''), we skip until we have found a
 *     number of matching controllers that equals filterControllerIndex
 *   If filterHand is not set, we skip until we have found the nth matching
 *   controller, where n equals filterControllerIndex
 *
 * The method should be called with one of: [filterIdExact, filterIdPrefix] AND
 * one or both of: [filterHand, filterControllerIndex]
 *
 * @param {object} controllers - Array of gamepads to search
 * @param {string} filterIdExact - If set, used to find controllers with id === this value
 * @param {string} filterIdPrefix - If set, used to find controllers with id startsWith this value
 * @param {object} filterHand - If set, further filters controllers with matching 'hand' property
 * @param {object} filterControllerIndex - Find the nth matching controller,
 * where n equals filterControllerIndex. defaults to 0.
 */
function findMatchingControllerWebVR (controllers, filterIdExact, filterIdPrefix, filterHand,
                                 filterControllerIndex) {
  var controller;
  var i;
  var matchingControllerOccurence = 0;
  var targetControllerMatch = filterControllerIndex >= 0 ? filterControllerIndex : 0;

  for (i = 0; i < controllers.length; i++) {
    controller = controllers[i];

    // Determine if the controller ID matches our criteria.
    if (filterIdPrefix && !controller.id.startsWith(filterIdPrefix)) {
      continue;
    }

    if (!filterIdPrefix && controller.id !== filterIdExact) { continue; }

    // If the hand filter and controller handedness are defined we compare them.
    if (filterHand && controller.hand && filterHand !== controller.hand) { continue; }

    // If we have detected an unhanded controller and the component was asking
    // for a particular hand, we need to treat the controllers in the array as
    // pairs of controllers. This effectively means that we need to skip
    // NUM_HANDS matches for each controller number, instead of 1.
    if (filterHand && !controller.hand) {
      targetControllerMatch = NUM_HANDS * filterControllerIndex + ((filterHand === DEFAULT_HANDEDNESS) ? 0 : 1);
    } else {
      return controller;
    }

    // We are looking for the nth occurence of a matching controller
    // (n equals targetControllerMatch).
    if (matchingControllerOccurence === targetControllerMatch) { return controller; }
    ++matchingControllerOccurence;
  }
  return undefined;
}

function findMatchingControllerWebXR (controllers, idPrefix, handedness, index, iterateProfiles, handTracking) {
  var i;
  var j;
  var controller;
  var controllerMatch = false;
  var controllerHasHandedness;
  var profiles;
  for (i = 0; i < controllers.length; i++) {
    controller = controllers[i];
    profiles = controller.profiles;
    if (handTracking) {
      controllerMatch = controller.hand;
    } else {
      if (iterateProfiles) {
        for (j = 0; j < profiles.length; j++) {
          controllerMatch = profiles[j].startsWith(idPrefix);
          if (controllerMatch) { break; }
        }
      } else {
        controllerMatch = profiles.length > 0 && profiles[0].startsWith(idPrefix);
      }
    }
    if (!controllerMatch) { continue; }
    // Vive controllers are assigned handedness at runtime and it might not be always available.
    controllerHasHandedness = controller.handedness === 'right' || controller.handedness === 'left';
    if (controllerHasHandedness) {
      if (controller.handedness === handedness) { return controllers[i]; }
    } else { // Fallback to index if controller has no handedness.
      if ((i === index)) { return controllers[i]; }
    }
  }
  return undefined;
}

module.exports.findMatchingControllerWebVR = findMatchingControllerWebVR;
module.exports.findMatchingControllerWebXR = findMatchingControllerWebXR;

/**
 * Emit specific `moved` event(s) if axes changed based on original axismoved event.
 *
 * @param {object} component - Controller component in use.
 * @param {array} axesMapping - For example `{thumbstick: [0, 1]}`.
 * @param {object} evt - Event to process.
 */
module.exports.emitIfAxesChanged = function (component, axesMapping, evt) {
  var axes;
  var buttonType;
  var changed;
  var detail;
  var j;

  for (buttonType in axesMapping) {
    axes = axesMapping[buttonType];

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
    component.el.emit(buttonType + 'moved', detail);
  }
};

/**
 * Handle a button event and reemits the events.
 *
 * @param {string} id - id of the button.
 * @param {string} evtName - name of the reemitted event
 * @param {object} component - reference to the component
 * @param {string} hand - handedness of the controller: left or right.
 */
module.exports.onButtonEvent = function (id, evtName, component, hand) {
  var mapping = hand ? component.mapping[hand] : component.mapping;
  var buttonName = mapping.buttons[id];
  component.el.emit(buttonName + evtName);
  if (component.updateModel) {
    component.updateModel(buttonName, evtName);
  }
};
