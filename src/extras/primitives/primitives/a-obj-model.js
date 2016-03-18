var meshMixin = require('../getMeshMixin')();
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-obj-model', utils.extendDeep({}, meshMixin, {
  mappings: {
    src: 'obj-model.obj',
    mtl: 'obj-model.mtl'
  },

  transforms: {
    mtl: meshMixin.src
  }
}));
