var AEntity = require('../../core/a-entity');
var components = require('../../core/component').components;
var registerElement = require('../../core/a-register-element').registerElement;
var utils = require('../../utils/');

var debug = utils.debug;
var log = debug('extras:primitives:debug');

module.exports = function registerPrimitive (name, definition) {
  name = name.toLowerCase();
  log('Registering <%s>', name);

  // Deprecation warning for defaultAttributes usage.
  if (definition.defaultAttributes) {
    console.warn("The 'defaultAttributes' object is deprecated. Use 'defaultComponents' instead.");
  }

  return registerElement(name, {
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
          this.applyDefaultComponents();
          // Apply initial attributes.
          Object.keys(attributes).forEach(function applyInitial (attributeName) {
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
          this.syncAttributeToComponent(attr, newVal);
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
              var attrValues = self.getAttribute(componentName) || {};
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

          // If multi-property schema, set as update to component to not overwrite.
          if (propertyName) {
            this.setAttribute(componentName, propertyName, value);
            return;
          }

          // Single-property schema, just set the value.
          this.setAttribute(componentName, value);
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
