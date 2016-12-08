/**
 * Return enumerated gamepads matching id prefix.
 *
 * @param {object} idPrefix - prefix to match in gamepad id, if any.
 */
module.exports.getGamepadsByPrefix = function (idPrefix) {
  var gamepadsList = [];
  var gamepad;
  var gamepads = navigator.getGamepads && navigator.getGamepads();
  if (!gamepads) { return gamepadsList; }

  for (var i = 0; i < gamepads.length; ++i) {
    gamepad = gamepads[i];
    // need to check that gamepad is valid, since browsers may return array of null values
    if (gamepad) {
      if (!idPrefix || gamepad.id.indexOf(idPrefix) === 0) {
        gamepadsList.push(gamepad);
      }
    }
  }
  return gamepadsList;
};

/**
 * Enumerate controllers (as built by system tick, e.g. that have pose) and check if they match parameters.
 *
 * @param {object} sceneEl - the scene element.
 * @param {object} idPrefix - prefix to match in gamepad id, if any.
 * @param {object} queryObject - map of values to match (hand; index among controllers with idPrefix)
 */
module.exports.isControllerPresent = function (sceneEl, idPrefix, queryObject) {
  var isPresent = false;
  var index = 0;
  var gamepad;
  var isPrefixMatch;
  var gamepads;
  var trackedControlsSystem = sceneEl && sceneEl.systems['tracked-controls'];
  if (!trackedControlsSystem) { return isPresent; }
  gamepads = trackedControlsSystem.controllers;
  if (!gamepads || gamepads.length === 0) {
    trackedControlsSystem.updateControllerList();
    gamepads = trackedControlsSystem.controllers;
  }
  if (!gamepads) { return isPresent; }

  for (var i = 0; i < gamepads.length; ++i) {
    gamepad = gamepads[i];
    isPrefixMatch = (!idPrefix || idPrefix === '' || gamepad.id.indexOf(idPrefix) === 0);
    isPresent = isPrefixMatch;
    if (isPresent && queryObject.hand) {
      isPresent = gamepad.hand === queryObject.hand;
    }
    if (isPresent && queryObject.index) {
      isPresent = index === queryObject.index; // need to use count of gamepads with idPrefix
    }
    if (isPresent) { break; }
    if (isPrefixMatch) { index++; } // update count of gamepads with idPrefix
  }
  return isPresent;
};

