/* global HTMLElement */
var ANode = require('./a-node');
var registerElement = require('./a-register-element').registerElement;
var components = require('./component').components;

/**
 * @member {object} componentAttrCache - Cache of pre parsed component attributes
 */
module.exports = registerElement('a-mixin', {
  prototype: Object.create(
    ANode.prototype,
    {
      createdCallback: {
        value: function () {
          this.componentAttrCache = {};
        }
      },

      attributeChangedCallback: {
        value: function (attr, oldVal, newVal) {
          this.cacheAttribute(attr, newVal);
        }
      },

      attachedCallback: {
        value: function () {
          this.cacheAttributes();
          this.load();
        },
        writable: window.debug
      },

      setAttribute: {
        value: function (attr, value) {
          this.cacheAttribute(attr, value);
          HTMLElement.prototype.setAttribute.call(this, attr, value);
        },
        writable: window.debug
      },

      cacheAttribute: {
        value: function (attr, value) {
          var component = components[attr];
          if (!component) { return; }
          value = value === undefined ? HTMLElement.prototype.getAttribute.call(this, attr) : value;
          this.componentAttrCache[attr] = component.parseAttrValueForCache(value);
        }
      },

      getAttribute: {
        value: function (attr) {
          return this.componentAttrCache[attr] || HTMLElement.prototype.getAttribute.call(this, attr);
        },
        writable: window.debug
      },

      /**
       * Update cache of parsed component attributes
       */
      cacheAttributes: {
        value: function () {
          var attributes = this.attributes;
          var attrName;
          var i;
          for (i = 0; i < attributes.length; ++i) {
            attrName = attributes[i].name;
            this.cacheAttribute(attrName);
          }
        }
      }
    }
  )
});
