var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../primitives').registerPrimitive;
var utils = require('../../../utils/');

registerPrimitive('a-cursor', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    cursor: {},
    geometry: {
      primitive: 'ring',
      radiusOuter: 0.016,
      radiusInner: 0.01,
      segmentsTheta: 32
    },
    material: {
      color: '#000',
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
    far: 'raycaster.far',
    fuse: 'cursor.fuse',
    'fuse-timeout': 'cursor.fuseTimeout',
    interval: 'raycaster.interval',
    objects: 'raycaster.objects'
  }
}));
