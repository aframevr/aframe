var Component = require('./component');
var utils = require('../vr-utils');

// To keep track of registered components
var components = {};

module.exports.registerComponent = function (name, proto) {
  var NewComponent;
  if (components[name]) {
    utils.error('The component ' + name + ' has been already registered');
  }
  NewComponent = function (el) {
    Component.call(this, el);
  };
  NewComponent.prototype = Object.create(Component.prototype, proto);
  NewComponent.prototype.name = name;
  NewComponent.prototype.constructor = NewComponent;
  components[name] = { Component: NewComponent };
  return NewComponent;
};

module.exports.components = components;
