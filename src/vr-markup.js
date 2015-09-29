require('./vr-register-element');

var VRObject = require('./core/vr-object');
var VRNode = require('./core/vr-node');

// Exports THREE to the window object so we can
// use three.js without alteration
var THREE = window.THREE = require('../lib/three');
var VRUtils = require('./vr-utils');

require('./core/vr-assets');
require('./core/vr-style');
require('./core/vr-scene');

require('./vr-animation');
require('./vr-behavior');
require('./vr-cursor');

module.exports = {
  THREE: THREE,
  VRObject: VRObject,
  VRNode: VRNode,
  utils: VRUtils
};
