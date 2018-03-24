var registerPrimitive = require('../primitives').registerPrimitive;

registerPrimitive('a-camera', {
  defaultComponents: {
    'camera': {},
    'look-controls': {},
    'wasd-controls': {},
    'position': {y: 1.6}
  },

  mappings: {
    active: 'camera.active',
    far: 'camera.far',
    fov: 'camera.fov',
    'look-controls-enabled': 'look-controls.enabled',
    near: 'camera.near',
    'pointer-lock-enabled': 'look-controls.pointerLockEnabled',
    'wasd-controls-enabled': 'wasd-controls.enabled',
    'reverse-mouse-drag': 'look-controls.reverseMouseDrag',
    zoom: 'camera.zoom'
  }
});
