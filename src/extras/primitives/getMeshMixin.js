/**
 * Common mesh defaults, mappings, and transforms.
 */
var shaders = require('../../core/shader').shaders;
var utils = require('../../utils/');

var materialMappings = {};
Object.keys(shaders.standard.schema).forEach(function addMapping (prop) {
  // To hyphenated.
  var htmlAttrName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  materialMappings[htmlAttrName] = 'material.' + prop;
});

module.exports = function getMeshMixin () {
  return {
    defaultComponents: {material: {}},
    mappings: utils.extend({}, materialMappings)
  };
};
