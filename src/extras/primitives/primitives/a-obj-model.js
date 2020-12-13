let meshMixin = require('../getMeshMixin')();
let registerPrimitive = require('../primitives').registerPrimitive;
let utils = require('../../../utils/');

registerPrimitive('a-obj-model', utils.extendDeep({}, meshMixin, {
  defaultComponents: {
    'obj-model': {}
  },

  mappings: {
    src: 'obj-model.obj',
    mtl: 'obj-model.mtl'
  }
}));
