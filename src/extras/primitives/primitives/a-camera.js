var registerPrimitive = require('../primitives').registerPrimitive;

registerPrimitive('a-camera', {
  defaultComponents: {
    'camera': {},
    'look-controls': {},
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
    zoom: 'camera.zoom'
  }
});
