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
export function checkControllerPresentAndSetup (component, idPrefix, queryObject) {
  var el = component.el;
  var controller;
  var isControllerPresent = isControllerPresentWebXR;
  var isPresent;

  controller = isControllerPresent(component, idPrefix, queryObject);
  isPresent = !!controller;

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
}

/**
 *
 * @param {object} component - Tracked controls component.
 * @returns {boolean} True if a controller is present.
 */
export function isControllerPresentWebXR (component, id, queryObject) {
  var controllers;
  var sceneEl = component.el.sceneEl;
  var trackedControlsSystem = sceneEl && sceneEl.systems['tracked-controls'];
  if (!trackedControlsSystem) { return false; }

  controllers = trackedControlsSystem.controllers;
  if (!controllers || !controllers.length) { return false; }

  return findMatchingControllerWebXR(
    controllers, id,
    queryObject.hand, queryObject.index, queryObject.iterateControllerProfiles, queryObject.handTracking);
}

export function findMatchingControllerWebXR (controllers, idPrefix, handedness, index, iterateProfiles, handTracking) {
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

/**
 * Emit specific `moved` event(s) if axes changed based on original axismove event.
 *
 * @param {object} component - Controller component in use.
 * @param {object} axesMapping - For example `{thumbstick: [0, 1]}`.
 * @param {object} evt - Event to process.
 */
export function emitIfAxesChanged (component, axesMapping, evt) {
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
}

/**
 * Handle a button event and reemits the events.
 *
 * @param {string} id - id of the button.
 * @param {string} evtName - name of the reemitted event
 * @param {object} component - reference to the component
 * @param {string} hand - handedness of the controller: left or right.
 */
export function onButtonEvent (id, evtName, component, hand) {
  var mapping = hand ? component.mapping[hand] : component.mapping;
  var buttonName = mapping.buttons[id];
  component.el.emit(buttonName + evtName);
  if (component.updateModel) {
    component.updateModel(buttonName, evtName);
  }
}
