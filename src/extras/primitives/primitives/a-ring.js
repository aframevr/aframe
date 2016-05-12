var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-ring', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      primitive: 'ring'
    }
  },

  mappings: {
    'radius-inner': 'geometry.radiusInner',
    'radius-outer': 'geometry.radiusOuter',
    'segments-phi': 'geometry.segments-phi',
    'segments-theta': 'geometry.segments-theta',
    'theta-length': 'geometry.theta-length',
    'theta-start': 'geometry.theta-start'
  }
}));
