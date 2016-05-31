var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-box', {
  includeMeshProperties: true,

  defaultComponents: {
    geometry: {primitive: 'box'}
  },

  mappings: {
    depth: 'geometry.depth',
    height: 'geometry.height',
    width: 'geometry.width'
  }
});
