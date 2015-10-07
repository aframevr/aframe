require('./vr-register-element');

var VRObject = require('./core/vr-object');
var VRNode = require('./core/vr-node');

// Exports THREE to the window object so we can
// use three.js without alteration
var THREE = window.THREE = require('../lib/three');
var VRUtils = require('./vr-utils');

require('./core/vr-animation');
require('./core/vr-assets');
require('./core/vr-mixin');
require('./core/vr-scene');

module.exports = {
  THREE: THREE,
  VRObject: VRObject,
  VRNode: VRNode,
  utils: VRUtils
};
