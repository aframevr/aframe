var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../primitives').registerPrimitive;
var utils = require('../../../utils/');
var meshPrimitives = require('./meshPrimitives');

registerPrimitive('a-sky', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      primitive: 'sphere',
      radius: 5000,
      segmentsWidth: 64,
      segmentsHeight: 20
    },
    material: {
      color: '#FFF',
      shader: 'flat'
    },
    scale: '-1 1 1'
  },

  mappings: utils.extendDeep({}, meshPrimitives['a-sphere'].prototype.mappings)
}));
