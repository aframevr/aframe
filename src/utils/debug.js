var debugLib = require('debug');
var extend = require('object-assign');

var settings = {
  colors: {
    debug: 'gray',
    error: 'red',
    info: 'gray',
    warn: 'orange'
  }
};

/**
 * Monkeypatches `debug` so we can colorize error/warning messages.
 *
 * (See issue: https://github.com/visionmedia/debug/issues/137)
 */
var debug = function (namespace) {
  var d = debugLib(namespace);

  d.color = getDebugNamespaceColor(namespace);

  return d;
};
extend(debug, debugLib);

/**
 * Returns the type of the namespace (e.g., `error`, `warn`).
 *
 * @param {String} namespace
 *   The debug logger's namespace (e.g., `components:geometry:warn`).
 * @returns {String} The type of the namespace (e.g., `warn`).
 * @api private
 */
function getDebugNamespaceType (namespace) {
  var chunks = namespace.split(':');

  return chunks[chunks.length - 1];  // Return the last one
}

/**
 * Returns the color of the namespace (e.g., `orange`).
 *
 * @param {String} namespace
 *   The debug logger's namespace (e.g., `components:geometry:warn`).
 * @returns {String} The color of the namespace (e.g., `orange`).
 * @api private
 */
function getDebugNamespaceColor (namespace) {
  var type = getDebugNamespaceType(namespace);

  var color = settings.colors && settings.colors[type];

  return color || null;
}

/**
 * Returns `localStorage` if possible.
 *
 * This is necessary because Safari throws when a user disables
 * cookies or `localStorage` and you attempt to access it.
 *
 * @returns {localStorage}
 * @api private
 */
function storage () {
  try {
    return window.localStorage;
  } catch (e) {
  }
}

/**
 * To enable console logging, type this in the Console of your Dev Tools:
 *
 *   localStorage.logs = 1
 *
 * To disable console logging:
 *
 *   localStorage.logs = 0
 *
 */
var ls = storage();
if (ls && (parseInt(ls.logs, 10) || ls.logs === 'true')) {
  debug.enable('*');
} else {
  debug.enable('*:error,*:info,*:warn');
}

if (process.browser) { window.logs = debug; }

module.exports = debug;
