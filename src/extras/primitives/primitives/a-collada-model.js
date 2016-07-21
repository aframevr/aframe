var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../primitives').registerPrimitive;
var utils = require('../../../utils/');

registerPrimitive('a-collada-model', utils.extendDeep({}, getMeshMixin(), {
  mappings: {
    src: 'collada-model'
  }
}));
