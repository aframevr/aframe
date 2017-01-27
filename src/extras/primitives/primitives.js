var AEntity = require('../../core/a-entity');
var components = require('../../core/component').components;
var registerElement = require('../../core/a-register-element').registerElement;
var utils = require('../../utils/');

var debug = utils.debug;
var setComponentProperty = utils.entity.setComponentProperty;
var log = debug('extras:primitives:debug');
var warn = debug('extras:primitives:warn');

var primitives = module.exports.primitives = {};

module.exports.registerPrimitive = function registerPrimitive (name, definition) {
  name = name.toLowerCase();
  log('Registering <%s>', name);

  // Deprecation warning for defaultAttributes usage.
  if (definition.defaultAttributes) {
    warn("The 'defaultAttributes' object is deprecated. Use 'defaultComponents' instead.");
  }

  var primitive = registerElement(name, {
    prototype: Object.create(AEntity.prototype, {
      defaultComponentsFromPrimitive: {
        value: definition.defaultComponents || definition.defaultAttributes || {}
      },
      deprecated: {value: definition.deprecated || null},
      deprecatedMappings: {value: definition.deprecatedMappings || {}},
      mappings: {value: definition.mappings || {}},

      createdCallback: {
        value: function () {
          if (definition.deprecated) { console.warn(definition.deprecated); }
          this.resolveMappingCollisions();
        }
      },

      /**
       * If a mapping collides with a registered component name
       * it renames the mapping to componentname-property
       */
      resolveMappingCollisions: {
        value: function () {
          var mappings = this.mappings;
          var self = this;
          Object.keys(mappings).forEach(function resolveCollision (key) {
            var newAttribute;
            if (components[key]) {
              newAttribute = mappings[key].replace('.', '-');
              mappings[newAttribute] = mappings[key];
              delete mappings[key];
              console.warn('The primitive ' + self.tagName.toLowerCase() + ' has a mapping collision. ' +
                           'The attribute ' + key + ' has the same name as a registered component and' +
                           ' has been renamed to ' + newAttribute);
            }
          });
        }
      },

      getExtraComponents: {
        value: function () {
          var attr;
          var data;
          var i;
          var mapping;
          var mixins;
          var path;
          var self = this;

          // Gather component data from default components.
          data = utils.clone(this.defaultComponentsFromPrimitive);

          // Factor in mixins to overwrite default components.
          mixins = this.getAttribute('mixin');
          if (mixins) {
            mixins = mixins.trim().split(' ');
            mixins.forEach(function applyMixin (mixinId) {
              var mixinComponents = self.sceneEl.querySelector('#' + mixinId).componentCache;
              Object.keys(mixinComponents).forEach(function setComponent (name) {
                data[name] = utils.extendDeep(data[name] || {}, mixinComponents[name]);
              });
            });
          }

          // Gather component data from mappings.
          for (i = 0; i < this.attributes.length; i++) {
            attr = this.attributes[i];
            mapping = this.mappings[attr.name];
            if (mapping) {
              path = utils.entity.getComponentPropertyPath(mapping);
              if (path.constructor === Array) {
                data[path[0]][path[1]] = attr.value;
              } else {
                data[path] = attr.value;
              }
              continue;
            }
          }

          return data;
        }
      },

      /**
       * Sync to attribute to component property whenever mapped attribute changes.
       * If attribute is mapped to a component property, set the component property using
       * the attribute value.
       */
      attributeChangedCallback: {
        value: function (attr, oldVal, value) {
          var componentName = this.mappings[attr];

          if (attr in this.deprecatedMappings) {
            console.warn(this.deprecatedMappings[attr]);
          }

          if (!attr || !componentName) { return; }

          // Set value.
          setComponentProperty(this, componentName, value);
        }
      }
    })
  });

  // Store.
  primitives[name] = primitive;
  return primitive;
};

/**
 * Add component mappings using schema.
 */
function addComponentMapping (componentName, mappings) {
  var schema = components[componentName].schema;
  Object.keys(schema).map(function (prop) {
    // Hyphenate where there is camelCase.
    var attrName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    // If there is a mapping collision, prefix with component name and hyphen.
    if (mappings[attrName] !== undefined) { attrName = componentName + '-' + prop; }
    mappings[attrName] = componentName + '.' + prop;
  });
}

/**
 * Helper to define a primitive, building mappings using a component schema.
 */
function definePrimitive (tagName, defaultComponents, mappings) {
  // If no initial mappings provided, start from empty map.
  mappings = mappings || {};

  // From the default components, add mapping automagically.
  Object.keys(defaultComponents).map(function buildMappings (componentName) {
    addComponentMapping(componentName, mappings);
  });

  // Register the primitive.
  module.exports.registerPrimitive(tagName, utils.extendDeep({}, null, {
    defaultComponents: defaultComponents,
    mappings: mappings
  }));
}
module.exports.definePrimitive = definePrimitive;
