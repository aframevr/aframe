var meshMixin = require('../meshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-video', utils.extendDeep({}, meshMixin(), {
  defaultAttributes: {
    geometry: {
      primitive: 'plane'
    },
    material: {
      color: '#FFF',
      shader: 'flat',
      side: 'double',
      transparent: true
    }
  },

  mappings: {
    height: 'geometry.height',
    translate: 'geometry.translate',
    width: 'geometry.width'
  }
}));
