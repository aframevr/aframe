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
      segmentsTheta: 64
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
    },
    raycaster: {
      far: 1000
    }
  },

  mappings: {
    far: 'raycaster.far',
    fuse: 'cursor.fuse',
    interval: 'raycaster.interval',
    objects: 'raycaster.objects',
    'fuse-timeout': 'cursor.fuseTimeout'
  }
}));
