var error = require('debug')('device:error');

var vrDisplay;
var supportsVRSession = false;
var supportsARSession = false;

/**
 * Oculus Browser 7 doesn't support the WebXR gamepads module.
 * We fallback to WebVR API and will hotfix when implementation is complete.
 */
var isWebXRAvailable = module.exports.isWebXRAvailable = !window.debug && navigator.xr !== undefined;

// Catch vrdisplayactivate early to ensure we can enter VR mode after the scene loads.
window.addEventListener('vrdisplayactivate', function (evt) {
  var canvasEl;
  // WebXR takes priority if available.
  if (isWebXRAvailable) { return; }
  canvasEl = document.createElement('canvas');
  vrDisplay = evt.display;
  // We need to make sure the canvas has a WebGL context associated with it.
  // Otherwise, the requestPresent could be denied.
  canvasEl.getContext('webgl', {});
  // Request present immediately. a-scene will be allowed to enter VR without user gesture.
  vrDisplay.requestPresent([{source: canvasEl}]).then(function () {}, function () {});
});

// Support both WebVR and WebXR APIs.
if (isWebXRAvailable) {
  var updateEnterInterfaces = function () {
    var sceneEl = document.querySelector('a-scene');
    if (!sceneEl) {
      window.addEventListener('DOMContentLoaded', updateEnterInterfaces);
      return;
    }
    if (sceneEl.hasLoaded) {
      sceneEl.components['vr-mode-ui'].updateEnterInterfaces();
    } else {
      sceneEl.addEventListener('loaded', updateEnterInterfaces);
    }
  };
  var errorHandler = function (err) {
    error('WebXR session support error: ' + err.message);
  };
  if (navigator.xr.isSessionSupported) {
    // Current WebXR spec uses a boolean-returning isSessionSupported promise
    navigator.xr.isSessionSupported('immersive-vr').then(function (supported) {
      supportsVRSession = supported;
      updateEnterInterfaces();
    }).catch(errorHandler);

    navigator.xr.isSessionSupported('immersive-ar').then(function (supported) {
      supportsARSession = supported;
      updateEnterInterfaces();
    }).catch(function () {});
  } else if (navigator.xr.supportsSession) {
    // Fallback for implementations that haven't updated to the new spec yet,
    // the old version used supportsSession which is rejected for missing
    // support.
    navigator.xr.supportsSession('immersive-vr').then(function () {
      supportsVRSession = true;
      updateEnterInterfaces();
    }).catch(errorHandler);
    navigator.xr.supportsSession('immersive-ar').then(function () {
      supportsARSession = true;
      updateEnterInterfaces();
    }).catch(function () {});
  } else {
    error('WebXR has neither isSessionSupported or supportsSession?!');
  }
} else {
  if (navigator.getVRDisplays) {
    navigator.getVRDisplays().then(function (displays) {
      var sceneEl = document.querySelector('a-scene');
      vrDisplay = displays.length && displays[0];
      if (sceneEl) { sceneEl.emit('displayconnected', {vrDisplay: vrDisplay}); }
    });
  }
}

function getVRDisplay () { return vrDisplay; }
module.exports.getVRDisplay = getVRDisplay;

/**
 * Determine if a headset is connected by checking if a vrDisplay is available.
 */
function checkHeadsetConnected () {
  return supportsVRSession || supportsARSession || !!getVRDisplay();
}
module.exports.checkHeadsetConnected = checkHeadsetConnected;

function checkARSupport () { return supportsARSession; }
module.exports.checkARSupport = checkARSupport;

/**
 * Checks if browser is mobile and not stand-alone dedicated vr device.
 * @return {Boolean} True if mobile browser detected.
 */
var isMobile = (function () {
  var _isMobile = false;
  (function (a) {
    // eslint-disable-next-line no-useless-escape
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
      _isMobile = true;
    }
    if (isIOS() || isTablet() || isR7()) {
      _isMobile = true;
    }
    if (isMobileVR()) {
      _isMobile = false;
    }
  })(window.navigator.userAgent || window.navigator.vendor || window.opera);

  return function () { return _isMobile; };
})();
module.exports.isMobile = isMobile;

/**
 *  Detect tablet devices.
 *  @param {string} mockUserAgent - Allow passing a mock user agent for testing.
 */
function isTablet (mockUserAgent) {
  var userAgent = mockUserAgent || window.navigator.userAgent;
  return /ipad|Nexus (7|9)|xoom|sch-i800|playbook|tablet|kindle/i.test(userAgent);
}
module.exports.isTablet = isTablet;

function isIOS () {
  return /iPad|iPhone|iPod/.test(window.navigator.platform);
}
module.exports.isIOS = isIOS;

function isMobileDeviceRequestingDesktopSite () {
  return !isMobile() && !isMobileVR() && window.orientation !== undefined;
}
module.exports.isMobileDeviceRequestingDesktopSite = isMobileDeviceRequestingDesktopSite;

/**
 *  Detect Oculus Browser (standalone headset)
 */
function isOculusBrowser () {
  return /(OculusBrowser)/i.test(window.navigator.userAgent);
}
module.exports.isOculusBrowser = isOculusBrowser;

/**
 *  Detect Firefox Reality (standalone headset)
 */
function isFirefoxReality () {
  return /(Mobile VR)/i.test(window.navigator.userAgent);
}
module.exports.isFirefoxReality = isFirefoxReality;

/**
 *  Detect browsers in Stand-Alone headsets
 */
function isMobileVR () {
  return isOculusBrowser() || isFirefoxReality();
}
module.exports.isMobileVR = isMobileVR;

function isR7 () {
  return /R7 Build/.test(window.navigator.userAgent);
}
module.exports.isR7 = isR7;

/**
 * Checks mobile device orientation.
 * @return {Boolean} True if landscape orientation.
 */
module.exports.isLandscape = function () {
  var orientation = window.orientation;
  if (isR7()) { orientation += 90; }
  return orientation === 90 || orientation === -90;
};

/**
 * Check if running in a browser or spoofed browser (bundler).
 * We need to check a node api that isn't mocked on either side.
 * `require` and `module.exports` are mocked in browser by bundlers.
 * `window` is mocked in node.
 * `process` is also mocked by browserify, but has custom properties.
 */
module.exports.isBrowserEnvironment = !!(!process || process.browser);

/**
 * Check if running in node on the server.
 */
module.exports.isNodeEnvironment = !module.exports.isBrowserEnvironment;
