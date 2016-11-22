/**
 * Enumerate gamepads and apply callback function to each.
 *
 * @param {object} callback - callback function that takes gamepad as argument.
 * @param {object} idPrefix - prefix to match in gamepad id, if any.
 */
module.exports.enumerateGamepads = function (callback, idPrefix) {
  var gamepads = navigator.getGamepads && navigator.getGamepads();
  if (!gamepads) { return; }
  for (var i = 0; i < gamepads.length; ++i) {
    var gamepad = gamepads[i];
    if (!idPrefix || idPrefix === '' || gamepad.id.indexOf(idPrefix) === 0) {
      callback(gamepad, i);
    }
  }
};

/**
 * Enumerate controllers (as built by system tick, e.g. that have pose) and apply callback function to each.
 *
 * @param {object} callback - callback function that takes gamepad as argument.
 * @param {object} idPrefix - prefix to match in gamepad id, if any.
 */
module.exports.enumerateControllers = function (callback, idPrefix) {
  var sceneEl = document.querySelector('a-scene');
  var gamepads = sceneEl && sceneEl.systems['tracked-controls'] && sceneEl.systems['tracked-controls'].controllers;
  if (!gamepads) { return; }
  for (var i = 0; i < gamepads.length; ++i) {
    var gamepad = gamepads[i];
    if (!idPrefix || idPrefix === '' || gamepad.id.indexOf(idPrefix) === 0) {
      callback(gamepad, i);
    }
  }
};
