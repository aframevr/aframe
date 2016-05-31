var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-circle', {
  includeMeshProperties: true,

  defaultComponents: {
    geometry: {primitive: 'circle'}
  },

  mappings: {
    'radius': 'geometry.radius',
    'segments': 'geometry.segments',
    'theta-length': 'geometry.theta-length',
    'theta-start': 'geometry.theta-start'
  }
});
