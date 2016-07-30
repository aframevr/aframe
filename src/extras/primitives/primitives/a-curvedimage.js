var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../primitives').registerPrimitive;
var utils = require('../../../utils/');

registerPrimitive('a-curvedimage', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      height: 1,
      primitive: 'cylinder',
      radius: 2,
      segmentsRadial: 48,
      thetaLength: 270,
      openEnded: true,
      thetaStart: 0
    },
    material: {
      color: '#FFF',
      shader: 'flat',
      side: 'double',
      transparent: true,
      repeat: '-1 1'
    }
  },

  mappings: {
    height: 'geometry.height',
    'open-ended': 'geometry.openEnded',
    radius: 'geometry.radius',
    segments: 'geometry.segmentsRadial',
    start: 'geometry.thetaStart',
    'theta-length': 'geometry.thetaLength',
    'theta-start': 'geometry.thetaStart',
    'width': 'geometry.thetaLength'
  }
}));
