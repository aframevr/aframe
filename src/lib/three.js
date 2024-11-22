var THREE = require('./three.mjs').default;
// TODO: Eventually include these only if they are needed by a component.
global.THREE = THREE;
require('../../vendor/DeviceOrientationControls');

// In-memory caching for XHRs (for images, audio files, textures, etc.).
if (THREE.Cache) {
  THREE.Cache.enabled = true;
}

module.exports = THREE;
