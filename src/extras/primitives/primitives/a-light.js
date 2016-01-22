var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-light', {
  defaultAttributes: {
    light: {}
  },

  mappings: {
    angle: 'light.angle',
    color: 'light.color',
    'ground-color': 'light.groundColor',
    decay: 'light.decay',
    distance: 'light.distance',
    exponent: 'light.exponent',
    intensity: 'light.intensity',
    type: 'light.type'
  }
});
