var registerPrimitive = require('../register-primitive');

registerPrimitive('a-image', {
  defaults: {
    value: {
      geometry: {
        primitive: 'plane',
        width: 2,
        height: 2
      },
      material: {
        color: 'white',
        opacity: 1.0,
        shader: 'flat',
        side: 'both',
        transparent: true
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
      side: 'material.side',
      transparent: 'material.transparent',
      metalness: 'material.metalness',
      roughness: 'material.roughness',
      src: 'material.src'
    }
  },

  transforms: {
    value: {
      src: function (value) {
        // TODO: Default to transparent=false for peformance. True if png.
        return 'url(' + value + ')';
      }
    }
  }
});
