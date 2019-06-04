/* global customElements */
var ANode = require('./a-node').ANode;
var components = require('./component').components;
var utils = require('../utils');

var MULTIPLE_COMPONENT_DELIMITER = '__';

/**
 * @member {object} componentCache - Cache of pre-parsed values. An object where the keys
 *         are component names and the values are already parsed by the component.
 */
class AMixin extends ANode {
  static get observedAttributes () {
    return Object.keys(components);
  }

  constructor (self) {
    super(self);
    self = self || this;
    self.componentCache = {};
    self.isMixin = true;
  }

  attributeChangedCallback (attr, oldVal, newVal) {
    super.attributeChangedCallback(attr, oldVal, newVal);
    this.cacheAttribute(attr, newVal);
    this.updateEntities();
  }

  connectedCallback () {
    this.id = this.getAttribute('id');
    this.sceneEl = this.closestScene();
    this.cacheAttributes();
    this.updateEntities();
    this.load();
  }

  /**
   * setAttribute that parses and caches component values.
   */
  setAttribute (attr, value) {
    window.HTMLElement.prototype.setAttribute.call(this, attr, value);
    this.cacheAttribute(attr, value);
  }

  /**
   * If `attr` is a component, then parse the value using the schema and store it.
   */
  cacheAttribute (attr, value) {
    var component;
    var componentName;

    // Get component data.
    componentName = utils.split(attr, MULTIPLE_COMPONENT_DELIMITER)[0];
    component = components[componentName];
    if (!component) { return; }
    if (value === undefined) {
      value = window.HTMLElement.prototype.getAttribute.call(this, attr);
    }
    this.componentCache[attr] = component.parseAttrValueForCache(value);
  }

  /**
   * If `attr` is a component, then grab pre-parsed value from the cache.
   * Else do a normal getAttribute.
   */
  getAttribute (attr) {
    return this.componentCache[attr] ||
      window.HTMLElement.prototype.getAttribute.call(this, attr);
  }

  /**
   * Parse and cache every component defined on the mixin.
   */
  cacheAttributes () {
    var attributes = this.attributes;
    var attrName;
    var i;
    for (i = 0; i < attributes.length; i++) {
      attrName = attributes[i].name;
      this.cacheAttribute(attrName);
    }
  }

  /**
   * For entities that already have been loaded by the time the mixin was attached, tell
   * those entities to register the mixin and refresh their component data.
   */
  updateEntities () {
    var entity;
    var entities;
    var i;

    if (!this.sceneEl) { return; }

    entities = this.sceneEl.querySelectorAll('[mixin~=' + this.id + ']');
    for (i = 0; i < entities.length; i++) {
      entity = entities[i];
      if (!entity.hasLoaded || entity.isMixin) { continue; }
      entity.mixinUpdate(this.id);
    }
  }
}

customElements.define('a-mixin', AMixin);
