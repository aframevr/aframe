var DEFAULT_CAMERA_HEIGHT = require('../../../constants/').DEFAULT_CAMERA_HEIGHT;
var registerPrimitive = require('../primitives').registerPrimitive;

registerPrimitive('a-camera', {
  defaultComponents: {
    'camera': {},
    'look-controls': {
      userHeight: DEFAULT_CAMERA_HEIGHT
    },
    'wasd-controls': {}
  },

  mappings: {
    active: 'camera.active',
    far: 'camera.far',
    fov: 'camera.fov',
    'look-controls-enabled': 'look-controls.enabled',
    near: 'camera.near',
    'wasd-controls-enabled': 'wasd-controls.enabled',
    'reverse-mouse-drag': 'look-controls.reverseMouseDrag',
    'user-height': 'look-controls.userHeight',
    zoom: 'camera.zoom'
  }
});
