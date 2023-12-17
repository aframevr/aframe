var THREE = require('./three.module.js').default;

// In-memory caching for XHRs (for images, audio files, textures, etc.).
if (THREE.Cache) {
  THREE.Cache.enabled = true;
}

module.exports = THREE;
