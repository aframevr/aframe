var registerPrimitive = require('../lib/register-primitive');

module.exports = registerPrimitive('a-model', {
  defaults: {
    value: {
      material: {
        opacity: 1.0
      },
      loader: {
        format: 'collada'
      }
    }
  },

  mappings: {
    value: {
      opacity: 'material.opacity',
      src: 'loader.src',
      format: 'loader.format'
    }
  },

  transforms: {
    value: {
      src: function (value) {
        // return value;
        return 'url(' + value + ')';
      }
    }
  }
});
