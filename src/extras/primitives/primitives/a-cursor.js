var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-cursor', {
  includeMeshProperties: true,

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
    raycaster: {}
  },

  mappings: {
    far: 'raycaster.far',
    fuse: 'cursor.fuse',
    interval: 'raycaster.interval',
    objects: 'raycaster.objects',
    timeout: 'cursor.timeout'
  }
});
