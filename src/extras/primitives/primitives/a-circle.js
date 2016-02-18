var meshMixin = require('../meshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-circle', utils.extendDeep({}, meshMixin(), {
  defaultAttributes: {
    geometry: {
      primitive: 'circle'
    }
  },

  mappings: {
    'radius': 'geometry.radius',
    'segments': 'geometry.segments',
    'theta-length': 'geometry.theta-length',
    'theta-start': 'geometry.theta-start'
  }
}));
