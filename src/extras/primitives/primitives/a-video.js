let getMeshMixin = require('../getMeshMixin');
let registerPrimitive = require('../primitives').registerPrimitive;
let utils = require('../../../utils/');

registerPrimitive('a-video', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      primitive: 'plane'
    },
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
}));
