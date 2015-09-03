// Polyfill `document.registerElement`.
require('document-register-element');

var THREE = require('../lib/three');

// These are the only ones of which we actually need exported references.
var VRObject = require('./core/vr-object');
var VRUtils = require('./vr-utils');

// Requiring the module calls `document.registerElement` so the custom element will get created.
require('./core/vr-node');
require('./core/vr-camera');
require('./core/vr-scene');
require('./core/vr-assets');

require('./vr-animation');
require('./vr-behavior');
require('./vr-controls');
require('./vr-cursor');
require('./vr-fog');
require('./vr-geometry');
require('./vr-material');
require('./vr-mesh');

module.exports = {
  THREE: THREE,
  VRObject: VRObject,
  utils: VRUtils
};
