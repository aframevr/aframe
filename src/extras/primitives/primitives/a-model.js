var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-model', utils.extend({}, getMeshMixin(), {
  deprecated: '<a-model> is deprecated. Use <a-obj-model> or <a-collada-model> instead.',

  defaultAttributes: {
    loader: {
      format: 'collada'
    },
    material: {
      color: '#FFF'
    }
  },

  mappings: {
    src: 'loader.src',
    format: 'loader.format'
  }
}));
