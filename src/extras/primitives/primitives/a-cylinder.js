var meshMixin = require('../meshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-cylinder', utils.extendDeep({}, meshMixin(), {
  defaultAttributes: {
    geometry: {
      primitive: 'cylinder'
    }
  },

  mappings: {
    height: 'geometry.height',
    'open-ended': 'geometry.openEnded',
    radius: 'geometry.radius',
    'radius-bottom': 'geometry.radiusBottom',
    'radius-top': 'geometry.radiusTop',
    'segments-radial': 'geometry.segmentsRadial',
    'theta-length': 'geometry.thetaLength',
    'theta-start': 'geometry.thetaStart',
    translate: 'geometry.translate'
  }
}));
