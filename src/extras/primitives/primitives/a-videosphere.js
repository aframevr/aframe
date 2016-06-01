var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-videosphere', {
  includeMeshProperties: true,

  defaultComponents: {
    geometry: {
      primitive: 'sphere',
      radius: 5000,
      segmentsWidth: 64,
      segmentsHeight: 64
    },
    material: {
      color: '#FFF',
      shader: 'flat'
    },
    scale: '-1 1 1'
  },

  mappings: {
    radius: 'geometry.radius',
    'segments-height': 'geometry.segmentsHeight',
    'segments-width': 'geometry.segmentsWidth'
  }
});
