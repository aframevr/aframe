var registerPrimitive = require('../lib/register-primitive');

module.exports = registerPrimitive('a-cube', {
  defaults: {
    value: {
      geometry: {
        primitive: 'box',
        width: 5,
        height: 5,
        depth: 5,
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
      depth: 'geometry.depth',
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
      width: function (value) {
        if (value === '1') {
          this.setAttribute('color', 'hotpink');
        }
        return value;
      }
    }
  }
});
