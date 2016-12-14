var meshMixin = require('../getMeshMixin')();
var registerPrimitive = require('../primitives').registerPrimitive;
var utils = require('../../../utils/');

registerPrimitive('a-obj-model', utils.extendDeep({}, meshMixin, {
  defaultComponents: {
    'obj-model': {}
  },

  mappings: {
    src: 'obj-model.obj',
    mtl: 'obj-model.mtl'
  }
}));
