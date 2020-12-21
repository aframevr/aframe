var schema = require('./schema');
var utils = require('../utils/');
var parseProperties = schema.parseProperties;
var parseProperty = schema.parseProperty;
var stringifyProperties = schema.stringifyProperties;
var stringifyProperty = schema.stringifyProperty;
var extendProperties = schema.extendProperties;
var styleParser = utils.styleParser;

module.exports.baseProto = {
  /**
   * Contains the type schema and defaults for the data values.
   * Data is coerced into the types of the values of the defaults.
   */
  schema: {},

  /**
   * Init handler. Similar to attachedCallback.
   * Called during component initialization and is only run once.
   * Components can use this to set initial state.
   */
  init: function () { /* no-op */ },

  /**
   * Update handler. Similar to attributeChangedCallback.
   * Called whenever component's data changes.
   * Also called on component initialization when the component receives initial data.
   *
   * @param {object} prevData - Previous attributes of the component.
   */
  update: function (prevData) { /* no-op */ },

  /**
   * Tick handler.
   * Called on each tick of the scene render loop.
   * Affected by play and pause.
   *
   * @param {number} time - Scene tick time.
   * @param {number} timeDelta - Difference in current render time and previous render time.
   */
  tick: undefined,

  /**
   * Tock handler.
   * Called on each tock of the scene render loop.
   * Affected by play and pause.
   *
   * @param {number} time - Scene tick time.
   * @param {number} timeDelta - Difference in current render time and previous render time.
   * @param {object} camera - Camera used to render the last frame.
   */
  tock: undefined,

  /**
   * Called to start any dynamic behavior (e.g., animation, AI, events, physics).
   */
  play: function () { /* no-op */ },

  /**
   * Called to stop any dynamic behavior (e.g., animation, AI, events, physics).
   */
  pause: function () { /* no-op */ },

  /**
   * Remove handler. Similar to detachedCallback.
   * Called whenever system/component is removed from the entity (i.e., removeAttribute).
   * Components can use this to reset behavior on the entity.
   * Not sure for system.
   */
  remove: function () { /* no-op */ },

  /**
   * Parses each property based on property type.
   * If component is single-property, then parses the single property value.
   *
   * @param {string} value - HTML attribute value.
   * @param {boolean} silent - Suppress warning messages.
   * @returns {object} System/Component data.
   */
  parse: function (value, silent) {
    var schema = this.schema;
    if (this.isSingleProperty) { return parseProperty(value, schema); }
    return parseProperties(styleParser.parse(value), schema, true, this.name, silent);
  },

  /**
   * Stringify properties if necessary.
   *
   * Only called from `Entity.setAttribute` for properties whose parsers accept a non-string
   * value (e.g., selector, vec3 property types).
   *
   * @param {object} data - Complete component data.
   * @returns {string}
   */
  stringify: function (data) {
    var schema = this.schema;
    if (typeof data === 'string') { return data; }
    if (this.isSingleProperty) { return stringifyProperty(data, schema); }
    data = stringifyProperties(data, schema);
    return styleParser.stringify(data);
  },
  /**
   * Write cached attribute data to the entity DOM element.
   *
   * @param {boolean} isDefault - Whether component is a default component. Always flush for
   *   default components.
   */
  flushToDOM: function (isDefault) {
    var attrValue = isDefault ? this.data : this.attrValue;
    if (attrValue === null || attrValue === undefined) { return; }
    window.HTMLElement.prototype.setAttribute.call(this.el, this.attrName,
                                                   this.stringify(attrValue));
  },
  /**
   * Update the cache of the pre-parsed attribute value.
   *
   * @param {string} value - New data.
   * @param {boolean } clobber - Whether to wipe out and replace previous data.
   */
  updateCachedAttrValue: function (value, clobber) {
    var newAttrValue;
    var tempObject;
    var property;

    if (value === undefined) { return; }

    // If null value is the new attribute value, make the attribute value falsy.
    if (value === null) {
      if (this.isObjectBased && this.attrValue) {
        this.objectPool.recycle(this.attrValue);
      }
      this.attrValue = undefined;
      return;
    }

    if (value instanceof Object && !(value instanceof window.HTMLElement)) {
      // If value is an object, copy it to our pooled newAttrValue object to use to update
      // the attrValue.
      tempObject = this.objectPool.use();
      newAttrValue = utils.extend(tempObject, value);
    } else {
      newAttrValue = this.parseAttrValueForCache(value);
    }

    // Merge new data with previous `attrValue` if updating and not clobbering.
    if (this.isObjectBased && !clobber && this.attrValue) {
      for (property in this.attrValue) {
        if (newAttrValue[property] === undefined) {
          newAttrValue[property] = this.attrValue[property];
        }
      }
    }

    // Update attrValue.
    if (this.isObjectBased && !this.attrValue) {
      this.attrValue = this.objectPool.use();
    }
    utils.objectPool.clearObject(this.attrValue);
    this.attrValue = extendProperties(this.attrValue, newAttrValue, this.isObjectBased);
    utils.objectPool.clearObject(tempObject);
  },

  /**
   * Given an HTML attribute value parses the string based on the system/component schema.
   * To avoid double parsings of strings into strings we store the original instead
   * of the parsed one
   *
   * @param {string} value - HTML attribute value
   */
  parseAttrValueForCache: function (value) {
    var parsedValue;
    if (typeof value !== 'string') { return value; }
    if (this.isSingleProperty) {
      parsedValue = this.schema.parse(value);
      /**
       * To avoid bogus double parsings. Cached values will be parsed when building
       * component data. For instance when parsing a src id to its url, we want to cache
       * original string and not the parsed one (#monster -> models/monster.dae)
       * so when building data we parse the expected value.
       */
      if (typeof parsedValue === 'string') { parsedValue = value; }
    } else {
      // Parse using the style parser to avoid double parsing of individual properties.
      utils.objectPool.clearObject(this.parsingAttrValue);
      parsedValue = styleParser.parse(value, this.parsingAttrValue);
    }
    return parsedValue;
  }

};

/**
* Clone system/component data.
* Clone only the properties that are plain objects while keeping a reference for the rest.
*
* @param data - System/Component data to clone.
* @returns Cloned data.
*/
function copyData (dest, sourceData) {
  var parsedProperty;
  var key;
  for (key in sourceData) {
    if (sourceData[key] === undefined) { continue; }
    parsedProperty = sourceData[key];
    dest[key] = isObjectOrArray(parsedProperty)
      ? utils.clone(parsedProperty)
      : parsedProperty;
  }
  return dest;
}
module.exports.copyData = copyData;
function isObject (value) {
  return value && value.constructor === Object && !(value instanceof window.HTMLElement);
}
module.exports.isObject = isObject;
function isObjectOrArray (value) {
  return value && (value.constructor === Object || value.constructor === Array) &&
    !(value instanceof window.HTMLElement);
}
module.exports.isObjectOrArray = isObjectOrArray;
