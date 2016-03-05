var AEntity = require('../../core/a-entity');
var components = require('../../core/component').components;
var registerElement = require('../../core/a-register-element').registerElement;
var utils = require('../../utils/');

var debug = utils.debug;
var log = debug('extras:primitives');

module.exports = function registerPrimitive (name, definition) {
  name = name.toLowerCase();
  log('Registering <%s>', name);

  return registerElement(name, {
    prototype: Object.create(AEntity.prototype, {
      defaultAttributes: {
        value: definition.defaultAttributes || {}
      },

      deprecated: {
        value: definition.deprecated || null
      },

      deprecatedMappings: {
        value: definition.deprecatedMappings || {}
      },

      mappings: {
        value: definition.mappings || {}
      },

      transforms: {
        value: definition.transforms || {}
      },

      createdCallback: {
        value: function () {
          this.componentData = {};
          if (definition.deprecated) {
            console.warn(definition.deprecated);
          }
        }
      },

      attachedCallback: {
        value: function () {
          var self = this;
          var attributes = this.attributes;

          // Apply default components.
          this.componentData = cloneObject(this.defaultAttributes);
          Object.keys(this.componentData).forEach(function (componentName) {
            if (!self.hasAttribute(componentName)) {
              self.setAttribute(componentName, self.componentData[componentName]);
            }
          });

          // Apply initial attributes.
          Object.keys(attributes).forEach(function (attributeName) {
            var attr = attributes[attributeName];
            self.syncAttributeToComponent(attr.name, attr.value);
          });
        }
      },

      /**
       * Sync to attribute to component property whenever mapped attribute changes.
       */
      attributeChangedCallback: {
        value: function (attr, oldVal, newVal) {
          if (!this.mappings[attr]) {
            AEntity.prototype.attributeChangedCallback.call(this, attr, oldVal, newVal);
            return;
          }
          this.syncAttributeToComponent(attr, newVal);
        }
      },

      /**
       * If attribute is mapped to a component property, set the component property using
       * the attribute value.
       */
      syncAttributeToComponent: {
        value: function (attr, value) {
          var componentName;
          var split;
          var propertyName;

          if (attr in this.deprecatedMappings) {
            console.warn(this.deprecatedMappings[attr]);
          }

          if (!attr || !this.mappings[attr]) { return; }

          // Differentiate between single-property and multi-property component.
          componentName = this.mappings[attr];
          if (componentName.indexOf('.') !== -1) {
            split = this.mappings[attr].split('.');
            componentName = split[0];
            propertyName = split[1];
          }

          if (!components[componentName]) { return; }

          // Run transform.
          value = this.getTransformedValue(attr, value);

          // Initialize internal component data if necessary.
          if (!this.componentData[componentName]) {
            this.componentData[componentName] = this.defaultAttributes[componentName] || {};
          }

          // Update internal component data.
          if (propertyName) {
            this.componentData[componentName][propertyName] = value;
          } else {
            this.componentData[componentName] = value;
          }

          // Put component data.
          this.setAttribute(componentName, this.componentData[componentName]);
        }
      },

      /**
       * Calls defined transform function on value if any.
       */
      getTransformedValue: {
        value: function (attr, value) {
          if (!this.transforms || !this.transforms[attr]) { return value; }
          return this.transforms[attr].bind(this)(value);
        }
      }
    })
  });
};

/**
 * Clone an object, including inner objects one-level deep.
 * Used for copying defaultAttributes to componentData so primitives of the same type don't
 * affect each others' defaultAttributes object.
 */
function cloneObject (obj) {
  var clone = {};
  Object.keys(obj).forEach(function (key) {
    var value = obj[key];
    if (typeof value === 'object') {
      clone[key] = utils.extend({}, value);
    } else {
      clone[key] = value;
    }
  });
  return clone;
}
