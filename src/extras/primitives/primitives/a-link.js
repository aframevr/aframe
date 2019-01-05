var registerPrimitive = require('../primitives').registerPrimitive;
var autoPropertyMapping = require('../../../utils/autoPropertyMapping').autoPropertyMapping;

registerPrimitive('a-link', {
  defaultComponents: {
    link: {
      visualAspectEnabled: true
    }
  },

  mappings: autoPropertyMapping('link')
});
