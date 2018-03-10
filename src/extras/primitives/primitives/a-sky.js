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
      segmentsHeight: 32
    },
    material: {
      color: '#FFF',
      side: 'back',
      shader: 'flat',
      npot: true
    },
    scale: '-1 1 1'
  },

  mappings: utils.extendDeep({}, meshPrimitives['a-sphere'].prototype.mappings)
}));
