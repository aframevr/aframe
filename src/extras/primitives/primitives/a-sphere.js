var registerPrimitive = require('../register-primitive');

registerPrimitive('a-sphere', {
  defaults: {
    value: {
      geometry: {
        primitive: 'sphere',
        radius: 1,
        segmentsWidth: 36,
        segmentsHeight: 18
      },
      material: {
        color: 'gray',
        opacity: 1.0,
        shader: 'standard',
        transparent: true,
        metalness: 0.0,
        roughness: 0.5
      }
    }
  },

  mappings: {
    value: {
      radius: 'geometry.radius',
      segments: 'geometry.segmentsWidth',
      'segments-height': 'geometry.segmentsHeight',
      color: 'material.color',
      opacity: 'material.opacity',
      shader: 'material.shader',
      transparent: 'material.transparent',
      metalness: 'material.metalness',
      roughness: 'material.roughness',
      src: 'material.src'
    }
  },

  transforms: {
    value: {
      segments: function (value) {
        this.setAttribute('geometry', 'segmentsHeight', value / 2);
        return value;
      }
    }
  }
});
