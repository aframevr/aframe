var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-torus-knot', {
  includeMeshProperties: true,

  defaultComponents: {
    geometry: {primitive: 'torusKnot'}
  },

  mappings: {
    'p': 'geometry.p',
    'q': 'geometry.q',
    'radius': 'geometry.radius',
    'radius-tubular': 'geometry.radiusTubular',
    'segments-radial': 'geometry.segmentsRadial',
    'segments-tubular': 'geometry.segmentsTubular'
  }
});
