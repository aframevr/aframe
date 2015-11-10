var debug = require('../utils/debug');

var Component = require('./component');

var error = debug('core:register-component:error');

// To keep track of registered components
var components = {};

module.exports.registerComponent = function (name, proto) {
  var NewComponent;
  if (components[name]) {
    error('The component ' + name + ' has been already registered');
  }
  NewComponent = function (el) {
    Component.call(this, el);
  };
  NewComponent.prototype = Object.create(Component.prototype, proto);
  NewComponent.prototype.name = name;
  NewComponent.prototype.constructor = NewComponent;
  components[name] = {
    Component: NewComponent,
    dependencies: NewComponent.prototype.dependencies,
    parseAttributesString: NewComponent.prototype.parseAttributesString.bind(NewComponent.prototype),
    stringifyAttributes: NewComponent.prototype.stringifyAttributes.bind(NewComponent.prototype)
  };
  return NewComponent;
};

module.exports.components = components;
