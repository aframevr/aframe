var registerPrimitive = require('../register-primitive');

registerPrimitive('a-cylinder', {
  defaults: {
    value: {
      geometry: {
        primitive: 'cylinder',
        radius: 0.5,
        height: 1,
        openEnded: false
      },
      material: {
        opacity: 1.0,
        shader: 'standard',
        transparent: false,
        metalness: 0.0,
        roughness: 0.5,
        side: 'front'
      }
    }
  },

  mappings: {
    value: {
      radius: 'geometry.radius',
      'radius-top': 'geometry.radiusTop',
      'radius-bottom': 'geometry.radiusBottom',
      height: 'geometry.height',
      'segments-radial': 'geometry.segmentsRadial',
      'theta-start': 'geometry.thetaStart',
      'theta-length': 'geometry.thetaLength',
      'open-ended': 'geometry.openEnded',
      color: 'material.color',
      opacity: 'material.opacity',
      shader: 'material.shader',
      transparent: 'material.transparent',
      metalness: 'material.metalness',
      roughness: 'material.roughness',
      src: 'material.src',
      side: 'material.side'
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
