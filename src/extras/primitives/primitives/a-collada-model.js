var meshMixin = require('../meshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-collada-model', utils.extendDeep({}, meshMixin(), {
  mappings: {
    src: 'collada-model'
  }
}));
