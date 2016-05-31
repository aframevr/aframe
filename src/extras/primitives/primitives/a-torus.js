var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-torus', {
  includeMeshProperties: true,

  defaultComponents: {
    geometry: {primitive: 'torus'}
  },

  mappings: {
    'arc': 'geometry.arc',
    'radius': 'geometry.radius',
    'radius-tubular': 'geometry.radiusTubular',
    'segments-radial': 'geometry.segmentsRadial',
    'segments-tubular': 'geometry.segmentsTubular'
  }
});
