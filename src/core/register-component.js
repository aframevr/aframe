var Component = require('./component');
var utils = require('../vr-utils');

// To keep track of registered components
var components = {};

module.exports = function (name, proto) {
  var NewComponent;
  if (components[name]) {
    utils.error('The component ' + name + ' has been already registered');
  }
  NewComponent = function (el) {
    Component.call(this, el);
  };
  NewComponent.prototype = components[name] = Object.create(Component.prototype, proto);
  NewComponent.prototype.name = name;
  NewComponent.prototype.constructor = NewComponent;
  return NewComponent;
};
