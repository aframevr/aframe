/**
 * Common mesh defaults, mappings, and transforms.
 */
import { components } from '../../core/component.js';
import { shaders } from '../../core/shader.js';
import * as utils from '../../utils/index.js';

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

export default function getMeshMixin () {
  return {
    defaultComponents: {material: {}},
    mappings: utils.extend({}, materialMappings)
  };
}
