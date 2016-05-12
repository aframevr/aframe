var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-torus-knot', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      primitive: 'torusKnot'
    }
  },

  mappings: {
    'p': 'geometry.p',
    'q': 'geometry.q',
    'radius': 'geometry.radius',
    'radius-tubular': 'geometry.radiusTubular',
    'segments-radial': 'geometry.segmentsRadial',
    'segments-tubular': 'geometry.segmentsTubular'
  }
}));
