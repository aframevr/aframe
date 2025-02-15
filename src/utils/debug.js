import debug from 'debug';

var settings = {
  colors: {
    debug: 'gray',
    error: 'red',
    info: 'gray',
    warn: 'orange'
  }
};

/**
 * Overwrite `debug` so we can colorize error/warning messages  and remove Time Diff
 *
 * (See issue: https://github.com/debug-js/debug/issues/582#issuecomment-1755718739)
 */
debug.formatArgs = formatArgs;

function formatArgs (args) {
  args[0] =
    (this.useColors ? '%c' : '') +
    this.namespace +
    (this.useColors ? ' %c' : ' ') +
    args[0] +
    (this.useColors ? '%c ' : ' ');

  if (!this.useColors) {
    return;
  }
  this.color = getDebugNamespaceColor(this.namespace);
  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // The final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function (match) {
    if (match === '%%') {
      return;
    }
    index++;
    if (match === '%c') {
      // We only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Returns the type of the namespace (e.g., `error`, `warn`).
 *
 * @param {string} namespace
 *   The debug logger's namespace (e.g., `components:geometry:warn`).
 * @returns {string} The type of the namespace (e.g., `warn`).
 * @api private
 */
function getDebugNamespaceType (namespace) {
  var chunks = namespace.split(':');

  return chunks[chunks.length - 1];  // Return the last one
}

/**
 * Returns the color of the namespace (e.g., `orange`).
 *
 * @param {string} namespace
 *   The debug logger's namespace (e.g., `components:geometry:warn`).
 * @returns {string} The color of the namespace (e.g., `orange`).
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

export default debug;
