var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-plane', {
  includeMeshProperties: true,

  defaultComponents: {
    geometry: {
      primitive: 'plane'
    }
  },

  mappings: {
    height: 'geometry.height',
    width: 'geometry.width'
  }
});
