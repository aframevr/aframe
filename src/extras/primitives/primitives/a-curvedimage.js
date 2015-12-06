var registerPrimitive = require('../register-primitive');

registerPrimitive('a-curvedimage', {
  defaults: {
    value: {
      geometry: {
        primitive: 'cylinder',
        radius: 2,
        height: 1,
        segmentsRadial: 48,
        thetaStart: 0,
        thetaLength: 6.3,
        openEnded: true
      },
      material: {
        opacity: 1,
        shader: 'flat',
        side: 'double',
        transparent: true,
        repeat: '-1 1'
      }
    }
  },

  mappings: {
    value: {
      radius: 'geometry.radius',
      height: 'geometry.height',
      width: 'geometry.thetaLength',
      segments: 'geometry.segmentsRadial',
      openended: 'geometry.openEnded',
      start: 'geometry.thetaStart',
      color: 'material.color',
      opacity: 'material.opacity',
      shader: 'material.shader',
      transparent: 'material.transparent',
      src: 'material.src'
    }
  },

  transforms: {
    value: {
      src: function (value) {
        return 'url(' + value + ')';
      }
    }
  }
});
