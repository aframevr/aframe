var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

var boxDefinition = utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      primitive: 'box'
    }
  },

  mappings: {
    depth: 'geometry.depth',
    height: 'geometry.height',
    translate: 'geometry.translate',
    width: 'geometry.width'
  }
});

registerPrimitive('a-box', boxDefinition);
