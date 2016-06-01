var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-cone', {
  includeMeshProperties: true,

  defaultComponents: {
    geometry: {primitive: 'cone'}
  },

  mappings: {
    height: 'geometry.height',
    'open-ended': 'geometry.openEnded',
    'radius-bottom': 'geometry.radiusBottom',
    'radius-top': 'geometry.radiusTop',
    'segments-height': 'geometry.segmentsHeight',
    'segments-radial': 'geometry.segmentsRadial',
    'theta-length': 'geometry.thetaLength',
    'theta-start': 'geometry.thetaStart'
  }
});
