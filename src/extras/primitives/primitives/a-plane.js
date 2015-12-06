var registerPrimitive = require('../register-primitive');

registerPrimitive('a-plane', {
  defaults: {
    value: {
      geometry: {
        primitive: 'plane',
        width: 1,
        height: 1
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
      width: 'geometry.width',
      height: 'geometry.height',
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
      src: function (value) {
        return 'url(' + value + ')';
      }
    }
  }
});
