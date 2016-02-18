var meshMixin = require('../meshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-cone', utils.extendDeep({}, meshMixin(), {
  defaultAttributes: {
    geometry: {
      primitive: 'cone'
    }
  },

  mappings: {
    height: 'geometry.height',
    'open-ended': 'geometry.openEnded',
    'radius-bottom': 'geometry.radiusBottom',
    'radius-top': 'geometry.radiusTop',
    'segments-height': 'geometry.segmentsHeight',
    'segments-radial': 'geometry.segmentsRadial',
    'theta-length': 'geometry.thetaLength',
    'theta-start': 'geometry.thetaStart',
    translate: 'geometry.translate'
  }
}));
