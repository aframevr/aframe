var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-torus', utils.extendDeep({}, getMeshMixin(), {
  defaultAttributes: {
    geometry: {
      primitive: 'torus'
    }
  },

  mappings: {
    'arc': 'geometry.arc',
    'radius': 'geometry.radius',
    'radius-tubular': 'geometry.radiusTubular',
    'segments-radial': 'geometry.segmentsRadial',
    'segments-tubular': 'geometry.segmentsTubular'
  }
}));
