var registerPrimitive = require('../register-primitive');

registerPrimitive('a-light', {
  defaults: {
    value: {
      light: {
        angle: 1,
        color: '#fff',
        groundColor: '#fff',
        decay: 1,
        distance: 0,
        exponent: 10,
        intensity: 0,
        type: 'directional'
      }
    }
  },

  mappings: {
    value: {
      angle: 'light.angle',
      color: 'light.color',
      'ground-color': 'light.groundColor',
      decay: 'light.decay',
      distance: 'light.distance',
      exponent: 'light.exponent',
      intensity: 'light.intensity',
      type: 'light.type'
    }
  }
});
