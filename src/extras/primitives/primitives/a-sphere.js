var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-sphere', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      primitive: 'sphere'
    }
  },

  mappings: {
    radius: 'geometry.radius',
    segments: 'geometry.segments',
    'segments-height': 'geometry.segmentsHeight',
    'segments-width': 'geometry.segmentsWidth',
    'phi-length': 'geometry.phiLength',
    'phi-start': 'geometry.phiStart',
    'theta-length': 'geometry.thetaLength',
    'theta-start': 'geometry.thetaStart',
    translate: 'geometry.translate'
  }
}));
