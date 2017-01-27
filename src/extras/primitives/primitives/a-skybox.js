var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-skybox', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      primitive: 'box',
      depth: 100,
      height: 100,
      width: 100
    },
    material: {
      shader: 'cube'
    },
    scale: '-1 1 1'
  },

  mappings: {
    depth: 'geometry.depth',
    height: 'geometry.height',
    width: 'geometry.width'
  }
}));
