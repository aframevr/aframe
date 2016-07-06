/* global HTMLElement */
var ANode = require('./a-node');
var registerElement = require('./a-register-element').registerElement;
var components = require('./component').components;

/**
 * @member {object} componentCache - Cache of pre-parsed values. An object where the keys
 *         are component names and the values are already parsed by the component.
 */
module.exports = registerElement('a-mixin', {
  prototype: Object.create(ANode.prototype, {
    createdCallback: {
      value: function () {
        this.componentCache = {};
        this.id = this.getAttribute('id');
      }
    },

    attributeChangedCallback: {
      value: function (attr, oldVal, newVal) {
        this.cacheAttribute(attr, newVal);
      }
    },

    attachedCallback: {
      value: function () {
        this.sceneEl = this.closest('a-scene');
        this.cacheAttributes();
        this.updateEntities();
        this.load();
      }
    },

    /**
     * setAttribute that parses and caches component values.
     */
    setAttribute: {
      value: function (attr, value) {
        this.cacheAttribute(attr, value);
        HTMLElement.prototype.setAttribute.call(this, attr, value);
      }
    },

    /**
     * If `attr` is a component, then parse the value using the schema and store it.
     */
    cacheAttribute: {
      value: function (attr, value) {
        var component = components[attr];
        if (!component) { return; }
        if (value === undefined) {
          value = HTMLElement.prototype.getAttribute.call(this, attr);
        }
        this.componentCache[attr] = component.parseAttrValueForCache(value);
      }
    },

    /**
     * If `attr` is a component, then grab pre-parsed value from the cache.
     * Else do a normal getAttribute.
     */
    getAttribute: {
      value: function (attr) {
        return this.componentCache[attr] ||
               HTMLElement.prototype.getAttribute.call(this, attr);
      }
    },

    /**
     * Parse and cache every component defined on the mixin.
     */
    cacheAttributes: {
      value: function () {
        var attributes = this.attributes;
        var attrName;
        var i;
        for (i = 0; i < attributes.length; i++) {
          attrName = attributes[i].name;
          this.cacheAttribute(attrName);
        }
      }
    },

    /**
     * For entities that already have been loaded by the time the mixin was attached, tell
     * those entities to register the mixin and refresh their component data.
     */
    updateEntities: {
      value: function () {
        if (!this.sceneEl) { return; }
        var entities = this.sceneEl.querySelectorAll('[mixin~=' + this.id + ']');
        for (var i = 0; i < entities.length; i++) {
          var entity = entities[i];
          if (!entity.hasLoaded) { continue; }
          entity.registerMixin(this.id);
          Object.keys(this.componentCache).forEach(function updateComponent (componentName) {
            entity.updateComponent(componentName);
          });
        }
      }
    }
  })
});
