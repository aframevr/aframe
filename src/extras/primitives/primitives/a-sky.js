var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-sky', {
  includeMeshProperties: true,

  defaultComponents: {
    geometry: {
      primitive: 'sphere',
      radius: 100,
      segmentsWidth: 64,
      segmentsHeight: 20
    },
    material: {
      color: '#FFF',
      shader: 'flat'
    },
    scale: '-1 1 1'
  },

  mappings: {
    radius: 'geometry.radius',
    'segments-width': 'geometry.segmentsWidth',
    'segments-height': 'geometry.segmentsHeight'
  }
});
