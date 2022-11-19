var registerPrimitive = require('../primitives').registerPrimitive;

registerPrimitive('a-light', {
  defaultComponents: {
    light: {}
  },

  mappings: {
    angle: 'light.angle',
    color: 'light.color',
    'ground-color': 'light.groundColor',
    decay: 'light.decay',
    distance: 'light.distance',
    intensity: 'light.intensity',
    penumbra: 'light.penumbra',
    type: 'light.type',
    target: 'light.target',
    envmap: 'light.envMap',
    'shadow-camera-automatic': 'light.shadowCameraAutomatic'
  }
});
