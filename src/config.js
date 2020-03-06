window.AFRAME_CONFIG = window.AFRAME_CONFIG || {};

var isIOSOlderThan10 = require('./utils/isIOSOlderThan10');
// Workaround for iOS Safari canvas sizing issues in stereo (webvr-polyfill/issues/102).
// Only for iOS on versions older than 10.
var bufferScale = isIOSOlderThan10(window.navigator.userAgent)
  ? 1 / window.devicePixelRatio
  : 1;

var DEFAULT_CONFIG = {
  ASSET_BASE_URL: 'https://cdn.aframe.io/',
  polyfillConfig: {
    BUFFER_SCALE: bufferScale,
    CARDBOARD_UI_DISABLED: true,
    ROTATE_INSTRUCTIONS_DISABLED: true
  },
  debug: {
    warnIfNotHead: true,
    warnIfFileProtocol: true
  }
};

function deepMerge (carry, toMerge) {
  var keys = Object.keys(toMerge);
  for (var i in keys) {
    var key = keys[i];
    if (typeof carry[key] === 'object') {
      deepMerge(carry[key], toMerge[key]);
    } else {
      carry[key] = toMerge[key];
    }
  }
  return carry;
}

var finalConfig = deepMerge(DEFAULT_CONFIG, window.AFRAME_CONFIG);

console.log({ finalConfig });

module.exports = finalConfig;
