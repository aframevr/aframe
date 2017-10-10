/**
 * Common mesh defaults, mappings, and transforms.
 */
var components = require('../../core/component').components;
var shaders = require('../../core/shader').shaders;
var utils = require('../../utils/');

var materialMappings = {};
Object.keys(components.material.schema).forEach(addMapping);
Object.keys(shaders.standard.schema).forEach(addMapping);

function addMapping (prop) {
  // To hyphenated.
  var htmlAttrName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  if (prop === 'fog') { htmlAttrName = 'material-fog'; }
  if (prop === 'visible') { htmlAttrName = 'material-visible'; }
  materialMappings[htmlAttrName] = 'material.' + prop;
}

module.exports = function getMeshMixin () {
  return {
    defaultComponents: {material: {}},
    mappings: utils.extend({}, materialMappings)
  };
};
