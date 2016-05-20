var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-gltf-model', utils.extendDeep({}, getMeshMixin(), {
  mappings: {
    src: 'gltf-model'
  }
}));
