var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-collada-model', {
  includeMeshProperties: true,

  mappings: {
    src: 'collada-model'
  }
});
