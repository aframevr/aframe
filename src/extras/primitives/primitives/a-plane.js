var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-plane', utils.extendDeep({}, getMeshMixin(), {
  defaultAttributes: {
    geometry: {
      primitive: 'plane'
    }
  },

  mappings: {
    height: 'geometry.height',
    translate: 'geometry.translate',
    width: 'geometry.width'
  }
}));
