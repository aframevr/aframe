var getMeshProperties = require('../getMeshProperties');
var registerPrimitive = require('../registerPrimitive');

var meshProperties = getMeshProperties();

registerPrimitive('a-obj-model', {
  includeMeshProperties: true,

  mappings: {
    src: 'obj-model.obj',
    mtl: 'obj-model.mtl'
  },

  transforms: {
    mtl: meshProperties.transforms.src
  }
});
