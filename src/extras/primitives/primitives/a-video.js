var registerPrimitive = require('../registerPrimitive');

registerPrimitive('a-video', {
  includeMeshProperties: true,

  defaultComponents: {
    geometry: {primitive: 'plane'},
    material: {
      color: '#FFF',
      shader: 'flat',
      side: 'double',
      transparent: true
    }
  },

  mappings: {
    height: 'geometry.height',
    width: 'geometry.width'
  }
});
