/* global customElements */
import { knownTags } from '../../core/a-node.js';
import { AEntity } from '../../core/a-entity.js';
import { components } from '../../core/component.js';
import * as utils from '../../utils/index.js';

var debug = utils.debug;
var setComponentProperty = utils.entity.setComponentProperty;
var log = debug('extras:primitives:debug');
var warn = debug('extras:primitives:warn');
var error = debug('extras:primitives:error');

export var primitives = {};

export function registerPrimitive (name, definition) {
  name = name.toLowerCase();

  if (knownTags[name]) {
    error('Trying to register primitive ' + name + ' that has been already previously registered');
    return;
  }

  knownTags[name] = true;

  log('Registering <%s>', name);

  // Deprecation warning for defaultAttributes usage.
  if (definition.defaultAttributes) {
    warn("The 'defaultAttributes' object is deprecated. Use 'defaultComponents' instead.");
  }

  var mappings = definition.mappings || {};
  var primitiveClass = class extends AEntity {
    constructor () {
      super();
      this.defaultComponentsFromPrimitive = definition.defaultComponents || definition.defaultAttributes || {};
      this.deprecated = definition.deprecated || null;
      this.deprecatedMappings = definition.deprecatedMappings || {};
      this.mappings = mappings;

      if (definition.deprecated) { console.warn(definition.deprecated); }
      this.resolveMappingCollisions();
    }

    /**
     * If a mapping collides with a registered component name
     * it renames the mapping to componentname-property
     */
    resolveMappingCollisions () {
      var mappings = this.mappings;
      var self = this;
      Object.keys(mappings).forEach(function resolveCollision (key) {
        var newAttribute;
        if (key !== key.toLowerCase()) { warn('Mapping keys should be specified in lower case. The mapping key ' + key + ' may not be recognized'); }
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

    getExtraComponents () {
      var attr;
      var data;
      var i;
      var mapping;
      var mixins;
      var self = this;

      // Gather component data from default components.
      data = utils.clone(this.defaultComponentsFromPrimitive);

      // Factor in mixins to overwrite default components.
      mixins = this.getAttribute('mixin');
      if (mixins) {
        mixins = utils.split(mixins.trim(), /\s+/);
        mixins.forEach(function applyMixin (mixinId) {
          var mixinEl = document.getElementById(mixinId);
          if (!mixinEl) { return; }
          var rawAttributeCache = mixinEl.rawAttributeCache;
          var mixinComponents = mixinEl.componentCache;
          for (var name in rawAttributeCache) {
            // Check if the attribute matches a mapping.
            mapping = self.mappings[name];
            if (mapping) {
              applyMapping(mapping, rawAttributeCache[name], data);
              return;
            }

            // Check if the attribute belongs to a component.
            if (name in mixinComponents) {
              data[name] = extend(data[name], mixinComponents[name]);
            }
          }
        });
      }

      // Gather component data from mappings.
      for (i = 0; i < this.attributes.length; i++) {
        attr = this.attributes[i];
        mapping = this.mappings[attr.name];
        if (mapping) {
          applyMapping(mapping, attr.value, data);
        }
      }

      return data;

      /**
       * For the base to be extensible, both objects must be pure JavaScript objects.
       * The function assumes that base is undefined, or null or a pure object.
       */
      function extend (base, extension) {
        if (isUndefined(base)) {
          return copy(extension);
        }
        if (isUndefined(extension)) {
          return copy(base);
        }
        if (isPureObject(base) && isPureObject(extension)) {
          return utils.extendDeep(base, extension);
        }
        return copy(extension);
      }

      function isUndefined (value) {
        return typeof value === 'undefined';
      }

      function copy (value) {
        if (isPureObject(value)) {
          return utils.extendDeep({}, value);
        }
        return value;
      }

      function isPureObject (value) {
        return value !== null && value.constructor === Object;
      }
    }

    /**
     * Sync to attribute to component property whenever mapped attribute changes.
     * If attribute is mapped to a component property, set the component property using
     * the attribute value.
     */
    attributeChangedCallback (attr, oldVal, value) {
      var componentName = this.mappings[attr];

      if (attr in this.deprecatedMappings) {
        console.warn(this.deprecatedMappings[attr]);
      }

      if (!attr || !componentName) {
        super.attributeChangedCallback(attr, oldVal, value);
        return;
      }

      // Set value.
      setComponentProperty(this, componentName, value);
    }
  };

  customElements.define(name, primitiveClass);
  primitiveClass.mappings = mappings;

  // Store.
  primitives[name] = primitiveClass;
  return primitiveClass;
}

/**
 * Sets the relevant property based on the mapping property path.
 *
 * @param {string} mapping - The mapped property path.
 * @param {string} attrValue - The (raw) attribute value.
 * @param {object} data - The data object to apply the mapping to.
 */
function applyMapping (mapping, attrValue, data) {
  var path = utils.entity.getComponentPropertyPath(mapping);
  if (path.constructor === Array) {
    data[path[0]] = data[path[0]] || {};
    data[path[0]][path[1]] = attrValue.trim();
  } else {
    data[path] = attrValue.trim();
  }
}

/**
 * Add component mappings using schema.
 */
function addComponentMapping (componentName, mappings) {
  var schema = components[componentName].schema;
  Object.keys(schema).forEach(function (prop) {
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
export function definePrimitive (tagName, defaultComponents, mappings) {
  // If no initial mappings provided, start from empty map.
  mappings = mappings || {};

  // From the default components, add mapping automagically.
  Object.keys(defaultComponents).forEach(function buildMappings (componentName) {
    addComponentMapping(componentName, mappings);
  });

  // Register the primitive.
  registerPrimitive(tagName, utils.extendDeep({}, null, {
    defaultComponents: defaultComponents,
    mappings: mappings
  }));
}
