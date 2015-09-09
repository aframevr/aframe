require('./vr-register-element');

var VRObject = require('./core/vr-object');
var VRNode = require('./core/vr-node');
var THREE = require('../lib/three');
var VRUtils = require('./vr-utils');

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

// Load some default components.
require('../components/vr-audio');
require('../components/vr-cube');
require('../components/vr-curvedPlane1');
require('../components/vr-curvedPlane2');
require('../components/vr-grid');
require('../components/vr-hemispherelight');
require('../components/vr-image');
require('../components/vr-model');
require('../components/vr-obj-loader');
require('../components/vr-plane');
require('../components/vr-skybox');
require('../components/vr-sphere');
require('../components/vr-video');
require('../components/vr-video360');

module.exports = {
  THREE: THREE,
  VRObject: VRObject,
  VRNode: VRNode,
  utils: VRUtils
};