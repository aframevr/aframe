var meshMixin = require('../meshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-cursor', utils.extendDeep({}, meshMixin(), {
  defaultAttributes: {
    cursor: {
      maxDistance: 1000
    },
    geometry: {
      primitive: 'ring',
      radiusOuter: 0.016,
      radiusInner: 0.01,
      segmentsTheta: 64
    },
    material: {
      shader: 'flat',
      opacity: 0.8
    },
    position: {
      x: 0,
      y: 0,
      z: -1
    }
  },

  mappings: {
    fuse: 'cursor.fuse',
    'max-distance': 'cursor.maxDistance',
    timeout: 'cursor.timeout'
  }
}));
