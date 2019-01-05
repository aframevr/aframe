var components = require('../core/component').components;

function camelCaseToDash (myStr) {
  return myStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

module.exports.autoPropertyMapping = function (componentName) {
  let mappings = {};

  if (components[componentName]) {
    Object.keys(components[componentName].schema).forEach(function (key, index) {
      mappings[camelCaseToDash(key)] = componentName + '.' + key;
    });
  }

  return mappings;
};
