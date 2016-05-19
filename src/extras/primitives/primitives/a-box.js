var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-box', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      primitive: 'box'
    }
  },

  mappings: {
    depth: 'geometry.depth',
    height: 'geometry.height',
    width: 'geometry.width'
  }
}));
