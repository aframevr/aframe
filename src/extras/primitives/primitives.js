var AEntity = require('../../core/a-entity');
var components = require('../../core/component').components;
var registerElement = require('../../core/a-register-element').registerElement;
var utils = require('../../utils/');

var bind = utils.bind;
var debug = utils.debug;
var getComponentPropertyPath = utils.entity.getComponentPropertyPath;
var setComponentProperty = utils.entity.setComponentProperty;
var log = debug('extras:primitives:debug');

var primitives = module.exports.primitives = {};

module.exports.registerPrimitive = function registerPrimitive (name, definition) {
  name = name.toLowerCase();
  log('Registering <%s>', name);

  // Deprecation warning for defaultAttributes usage.
  if (definition.defaultAttributes) {
    console.warn("The 'defaultAttributes' object is deprecated. Use 'defaultComponents' instead.");
  }

  var primitive = registerElement(name, {
    prototype: Object.create(AEntity.prototype, {
      defaultComponentsFromPrimitive: {
        value: definition.defaultComponents || definition.defaultAttributes || {}
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
          var components = {};

          // Apply initial attributes.
          this.applyDefaultComponents();

          // Group attributes by the component to which they are mapped.
          Object.keys(attributes).forEach(function groupAttributes (attributeIndex) {
            var attribute = attributes[attributeIndex];
            var attributeName = attribute.name;

            // Run the transform.
            var value = self.getTransformedValue(attributeName, attribute.value);

            var propertyPath = getComponentPropertyPath(
              self.getMapping(attributeName) || attributeName
            );
            var componentName = propertyPath[0];
            var propertyName = propertyPath[1];

            if (!componentName) { return; }

            if (propertyName) {
              components[componentName] = components[componentName] || {};
              components[componentName][propertyName] = value;
            } else {
              components[componentName] = value;
            }
          });

          // Apply attributes for each component.
          Object.keys(components).forEach(function applyInitial (componentName) {
            self.setAttribute(componentName, components[componentName]);
          });
        }
      },

      /**
       * Sync to attribute to component property whenever mapped attribute changes.
       */
      attributeChangedCallback: {
        value: function (attr, oldVal, newVal) {
          var componentName = this.getMapping(attr);

          if (!attr || !componentName) { return; }

          // Run transform.
          newVal = this.getTransformedValue(attr, newVal);

          // Set value.
          setComponentProperty(this, componentName, newVal);
        }
      },

      applyDefaultComponents: {
        value: function () {
          var self = this;
          var defaultData = this.defaultComponentsFromPrimitive;

          // Apply default components.
          Object.keys(defaultData).forEach(function applyDefault (componentName) {
            var componentData = defaultData[componentName];

            // Set component properties individually to not overwrite user-defined components.
            if (componentData instanceof Object) {
              var component = components[componentName];
              var attrValues = self.getDOMAttribute(componentName) || {};
              var data = component.parse(attrValues);

              // Check if component property already defined.
              Object.keys(componentData).forEach(function setProperty (propName) {
                if (data[propName]) { return; }
                data[propName] = componentData[propName];
              });
              self.setAttribute(componentName, data);
              return;
            }

            // Component is single-property schema, just set the attribute.
            self.setAttribute(componentName, componentData);
          });
        }
      },

      /**
       * Calls defined transform function on value if any.
       */
      getTransformedValue: {
        value: function (attr, value) {
          if (!this.transforms || !this.transforms[attr]) { return value; }
          return bind(this.transforms[attr], this)(value);
        }
      },

      /**
       * Returns the mapping path string for the given attribute.
       * @type {Object}
       */
      getMapping: {
        value: function (attr) {
          if (attr in this.deprecatedMappings) {
            console.warn(this.deprecatedMappings[attr]);
          }
          return this.mappings[attr];
        }
      }
    })
  });

  // Store.
  primitives[name] = primitive;
  return primitive;
};
