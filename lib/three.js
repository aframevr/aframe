var THREE = require('./vendor/three');

// TODO: Eventually include these only if they are needed by a component.
THREE.Cursor = require('../lib/cursor3D')(THREE);
THREE.Raycaster = require('../lib/vendor/Raycaster')(THREE);
THREE.ShaderLib.pbr = require('../src/shaders/pbr')(THREE);
THREE.VRControls = require('../lib/vendor/VRControls');
THREE.VREffect = require('../lib/vendor/VREffect');

module.exports = THREE;
