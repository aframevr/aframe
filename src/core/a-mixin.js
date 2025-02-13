/* global customElements */
import { ANode } from './a-node.js';
import { components } from './component.js';
import * as utils from '../utils/index.js';
import * as styleParser from '../utils/styleParser.js';

var MULTIPLE_COMPONENT_DELIMITER = '__';

/**
 * @property {object} componentCache - Cache of pre-parsed values. An object where the keys
 *         are component names and the values are already parsed by the component.
 * @property {object} rawAttributeCache - Cache of the raw attribute values.
 */
class AMixin extends ANode {
  constructor () {
    super();
    this.componentCache = {};
    this.rawAttributeCache = {};
    this.isMixin = true;
  }

  doConnectedCallback () {
    super.doConnectedCallback();

    this.sceneEl = this.closestScene();
    this.id = this.getAttribute('id');
    this.cacheAttributes();
    this.updateEntities();
    this.load();
  }

  attributeChangedCallback (attr, oldVal, newVal) {
    super.attributeChangedCallback();
    this.cacheAttribute(attr, newVal);
    this.updateEntities();
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
    if (value === undefined) {
      value = window.HTMLElement.prototype.getAttribute.call(this, attr);
    }

    this.rawAttributeCache[attr] = value;
    if (!component) { return; }
    this.componentCache[attr] = this.parseComponentAttrValue(component, value);
  }

  /**
   * Given an HTML attribute value parses the string based on the component schema.
   * To avoid double parsing of strings when mixed into the actual component,
   * we store the original instead of the parsed one.
   *
   * @param {object} component - The component to parse for.
   * @param {string} attrValue - HTML attribute value.
   */
  parseComponentAttrValue (component, attrValue) {
    var parsedValue;
    if (typeof attrValue !== 'string') { return attrValue; }
    if (component.isSingleProperty) {
      parsedValue = component.schema.parse(attrValue);
      if (typeof parsedValue === 'string') { parsedValue = attrValue; }
    } else {
      // Use style parser as the values will be parsed once mixed in.
      // Furthermore parsing might fail with dynamic schema's.
      parsedValue = styleParser.parse(attrValue);
    }
    return parsedValue;
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
