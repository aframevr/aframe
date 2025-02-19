/* global customElements */
import * as THREE from 'three';
import { ANode } from './a-node.js';
import { components as COMPONENTS } from './component.js';
import * as utils from '../utils/index.js';

var debug = utils.debug('core:a-entity:debug');
var warn = utils.debug('core:a-entity:warn');

var MULTIPLE_COMPONENT_DELIMITER = '__';
var OBJECT3D_COMPONENTS = ['position', 'rotation', 'scale', 'visible'];
var ONCE = {once: true};

/**
 * Entity is a container object that components are plugged into to comprise everything in
 * the scene. In A-Frame, they inherently have position, rotation, and scale.
 *
 * To be able to take components, the scene element inherits from the entity definition.
 *
 * @property {object} components - entity's currently initialized components.
 * @property {THREE.Object3D} object3D - three.js object.
 * @property {string[]} states
 * @property {boolean} isPlaying - false if dynamic behavior of the entity is paused.
 */
export class AEntity extends ANode {
  constructor () {
    super();
    this.components = {};
    // To avoid double initializations and infinite loops.
    this.initializingComponents = {};
    this.componentsToUpdate = {};
    this.isEntity = true;
    this.isPlaying = false;
    this.object3D = new THREE.Group();
    this.object3D.rotation.order = 'YXZ';
    this.object3D.el = this;
    this.object3DMap = {};
    this.parentEl = null;
    this.rotationObj = {};
    this.states = [];
  }

  /**
   * Handle changes coming from the browser DOM inspector.
   */
  attributeChangedCallback (attr, oldVal, newVal) {
    var component = this.components[attr];

    super.attributeChangedCallback();
    // If the empty string is passed by the component initialization
    // logic we ignore the component update.
    if (component && component.justInitialized && newVal === '') {
      delete component.justInitialized;
      return;
    }
    // When a component is removed after calling el.removeAttribute('material')
    if (!component && newVal === null) { return; }
    this.setEntityAttribute(attr, oldVal, newVal);
  }

  doConnectedCallback () {
    var self = this;  // Component.
    var assetsEl;  // Asset management system element.
    var sceneEl;

    // ANode method.
    super.doConnectedCallback();

    sceneEl = this.sceneEl;

    this.addToParent();

    // Don't .load() scene on attachedCallback.
    if (this.isScene) { return; }

    // Gracefully not error when outside of <a-scene> (e.g., tests).
    if (!sceneEl) {
      this.load();
      return;
    }

    // Wait for asset management system to finish before loading.
    assetsEl = sceneEl.querySelector('a-assets');
    if (assetsEl && !assetsEl.hasLoaded) {
      assetsEl.addEventListener('loaded', function () { self.load(); });
      return;
    }
    this.load();
  }

  /**
   * Tell parent to remove this element's object3D from its object3D.
   * Do not call on scene element because that will cause a call to document.body.remove().
   */
  disconnectedCallback () {
    var componentName;

    if (!this.parentEl) { return; }

    // Remove components.
    for (componentName in this.components) {
      this.removeComponent(componentName, false);
    }

    if (this.isScene) { return; }

    this.removeFromParent();
    super.disconnectedCallback();

    // Remove cyclic reference.
    this.object3D.el = null;
  }

  getObject3D (type) {
    return this.object3DMap[type];
  }

  /**
   * Set a THREE.Object3D into the map.
   *
   * @param {string} type - Developer-set name of the type of object, will be unique per type.
   * @param {THREE.Object3D} obj - A THREE.Object3D.
   */
  setObject3D (type, obj) {
    var oldObj;
    var self = this;

    if (!(obj instanceof THREE.Object3D)) {
      throw new Error(
        '`Entity.setObject3D` was called with an object that was not an instance of ' +
        'THREE.Object3D.'
      );
    }

    // Remove existing object of the type.
    oldObj = this.getObject3D(type);
    if (oldObj) { this.object3D.remove(oldObj); }

    // Set references to A-Frame entity.
    obj.el = this;
    if (obj.children.length) {
      obj.traverse(function bindEl (child) {
        child.el = self;
      });
    }

    // Add.
    this.object3D.add(obj);
    this.object3DMap[type] = obj;
    this.emit('object3dset', {object: obj, type: type});
  }

  /**
   * Remove object from scene and entity object3D map.
   */
  removeObject3D (type) {
    var obj = this.getObject3D(type);
    if (!obj) {
      warn('Tried to remove `Object3D` of type:', type, 'which was not defined.');
      return;
    }
    this.object3D.remove(obj);
    delete this.object3DMap[type];
    this.emit('object3dremove', {type: type});
  }

  /**
   * Gets or creates an object3D of a given type.
   *
   * @param {string} type - Type of the object3D.
   * @param {string} Constructor - Constructor to use to create the object3D if needed.
   * @returns {object}
   */
  getOrCreateObject3D (type, Constructor) {
    var object3D = this.getObject3D(type);
    if (!object3D && Constructor) {
      object3D = new Constructor();
      this.setObject3D(type, object3D);
    }
    warn('`getOrCreateObject3D` has been deprecated. Use `setObject3D()` ' +
         'and `object3dset` event instead.');
    return object3D;
  }

  /**
   * Add child entity.
   *
   * @param {Element} el - Child entity.
   */
  add (el) {
    if (!el.object3D) {
      throw new Error("Trying to add an element that doesn't have an `object3D`");
    }
    this.object3D.add(el.object3D);
    this.emit('child-attached', {el: el});
  }

  /**
   * Tell parentNode to add this entity to itself.
   */
  addToParent () {
    var parentNode = this.parentEl = this.parentNode;

    // `!parentNode` check primarily for unit tests.
    if (!parentNode || !parentNode.add || this.attachedToParent) { return; }

    parentNode.add(this);
    this.attachedToParent = true;  // To prevent multiple attachments to same parent.
  }

  /**
   * Tell parentNode to remove this entity from itself.
   */
  removeFromParent () {
    var parentEl = this.parentEl;
    this.parentEl.remove(this);
    this.attachedToParent = false;
    this.parentEl = null;
    parentEl.emit('child-detached', {el: this});
  }

  load () {
    var self = this;

    if (this.hasLoaded || !this.parentEl) { return; }

    super.load.call(this, function entityLoadCallback () {
      // Check if entity was detached while it was waiting to load.
      if (!self.parentEl) { return; }

      self.updateComponents();
      if (self.isScene || self.parentEl.isPlaying) { self.play(); }
    });
  }

  /**
   * Remove child entity.
   *
   * @param {Element} el - Child entity.
   */
  remove (el) {
    if (el) {
      this.object3D.remove(el.object3D);
    } else {
      this.parentNode.removeChild(this);
    }
  }

  /**
   * @returns {Array<Element>} Direct children that are entities.
   */
  getChildEntities () {
    var children = this.children;
    var childEntities = [];

    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child instanceof AEntity) {
        childEntities.push(child);
      }
    }

    return childEntities;
  }

  /**
   * Initialize component.
   *
   * @param {string} attrName - Attribute name associated to the component.
   * @param {object} data - Component data
   * @param {boolean} isDependency - True if the component is a dependency.
   */
  initComponent (attrName, data, isDependency) {
    var component;
    var componentId;
    var componentInfo;
    var componentName;
    var isComponentDefined;

    componentInfo = utils.split(attrName, MULTIPLE_COMPONENT_DELIMITER);
    componentName = componentInfo[0];
    componentId = componentInfo.length > 2
      ? componentInfo.slice(1).join('__')
      : componentInfo[1];

    // Not a registered component.
    if (!COMPONENTS[componentName]) { return; }

    // Component is not a dependency and is undefined.
    // If a component is a dependency, then it is okay to have no data.
    isComponentDefined = checkComponentDefined(this, attrName) ||
                         data !== undefined;
    if (!isComponentDefined && !isDependency) { return; }

    // Component already initialized.
    if (attrName in this.components) { return; }

    // Initialize dependencies first
    this.initComponentDependencies(componentName);

    // Initialize component
    component = new COMPONENTS[componentName].Component(this, data, componentId);
    if (this.isPlaying) { component.play(); }

    // Components are reflected in the DOM as attributes but the state is not shown
    // hence we set the attribute to empty string.
    // The flag justInitialized is for attributeChangedCallback to not overwrite
    // the component with the empty string.
    if (!this.hasAttribute(attrName)) {
      component.justInitialized = true;
      window.HTMLElement.prototype.setAttribute.call(this, attrName, '');
    }

    debug('Component initialized: %s', attrName);
  }

  /**
   * Initialize dependencies of a component.
   *
   * @param {string} name - Root component name.
   */
  initComponentDependencies (name) {
    var self = this;
    var component = COMPONENTS[name];
    var dependencies;
    var i;

    // Not a component.
    if (!component) { return; }

    // No dependencies.
    dependencies = COMPONENTS[name].dependencies;

    if (!dependencies) { return; }

    // Initialize dependencies.
    for (i = 0; i < dependencies.length; i++) {
      // Call getAttribute to initialize the data from the DOM.
      self.initComponent(
        dependencies[i],
        window.HTMLElement.prototype.getAttribute.call(self, dependencies[i]) || undefined,
        true
      );
    }
  }

  removeComponent (name, destroy) {
    var component;

    component = this.components[name];
    if (!component) { return; }

    // Wait for component to initialize.
    if (!component.initialized) {
      this.addEventListener('componentinitialized', function tryRemoveLater (evt) {
        if (evt.detail.name !== name) { return; }
        this.removeComponent(name, destroy);
        this.removeEventListener('componentinitialized', tryRemoveLater);
      });
      return;
    }

    component.pause();
    component.remove();

    // Keep component attached to entity in case of just full entity detach.
    if (destroy) {
      component.destroy();
      delete this.components[name];
      // Remove attribute from DOM, if still present
      if (this.hasAttribute(name)) {
        window.HTMLElement.prototype.removeAttribute.call(this, name);
      }
    }

    this.emit('componentremoved', component.evtDetail, false);
  }

  /**
   * Initialize or update all components.
   * Build data using initial components, defined attributes, mixins, and defaults.
   * Update default components before the rest.
   *
   * @property {function} getExtraComponents - Can be implemented to include component data
   *   from other sources (e.g., implemented by primitives).
   */
  updateComponents () {
    var data;
    var extraComponents;
    var i;
    var name;
    var componentsToUpdate = this.componentsToUpdate;

    if (!this.hasLoaded && !this.isLoading) { return; }

    // Gather mixin-defined components.
    for (i = 0; i < this.mixinEls.length; i++) {
      for (name in this.mixinEls[i].componentCache) {
        if (isComponent(name)) { componentsToUpdate[name] = true; }
      }
    }

    // Gather from extra initial component data if defined (e.g., primitives).
    if (this.getExtraComponents) {
      extraComponents = this.getExtraComponents();
      for (name in extraComponents) {
        if (isComponent(name)) { componentsToUpdate[name] = true; }
      }
    }

    // Gather entity-defined components.
    for (i = 0; i < this.attributes.length; ++i) {
      name = this.attributes[i].name;
      if (OBJECT3D_COMPONENTS.indexOf(name) !== -1) { continue; }
      if (isComponent(name)) { componentsToUpdate[name] = true; }
    }

    // object3D components first (position, rotation, scale, visible).
    for (i = 0; i < OBJECT3D_COMPONENTS.length; i++) {
      name = OBJECT3D_COMPONENTS[i];
      if (!this.hasAttribute(name)) { continue; }
      this.updateComponent(name, this.getDOMAttribute(name));
    }

    // Initialize or update rest of components.
    for (name in componentsToUpdate) {
      data = mergeComponentData(this.getDOMAttribute(name),
                                extraComponents && extraComponents[name]);
      this.updateComponent(name, data);
      delete componentsToUpdate[name];
    }
  }

  /**
   * Initialize, update, or remove a single component.
   *
   * When initializing, we set the component on `this.components`.
   *
   * @param {string} attr - Component name.
   * @param {object} attrValue - Value of the DOM attribute.
   * @param {boolean} clobber - If new attrValue completely replaces previous properties.
   */
  updateComponent (attr, attrValue, clobber) {
    var component = this.components[attr];

    if (component) {
      // Remove component.
      if (attrValue === null && !checkComponentDefined(this, attr)) {
        this.removeComponent(attr, true);
        return;
      }
      // Component already initialized. Update component.
      component.updateProperties(attrValue, clobber);
      return;
    }

    // Component not yet initialized. Initialize component.
    this.initComponent(attr, attrValue, false);
  }

  /**
   * If `attr` is a component name, detach the component from the entity.
   *
   * If `propertyName` is given, reset the component property value to its default.
   *
   * @param {string} attr - Attribute name, which could also be a component name.
   * @param {string} propertyName - Component prop name, if resetting an individual prop.
   */
  removeAttribute (attr, propertyName) {
    var component = this.components[attr];

    // Remove component.
    if (component && propertyName === undefined) {
      this.removeComponent(attr, true);
    }

    // Reset component property value.
    if (component && propertyName !== undefined) {
      component.resetProperty(propertyName);
      return;
    }

    // Remove mixins.
    if (attr === 'mixin') {
      this.mixinUpdate('');
    }

    window.HTMLElement.prototype.removeAttribute.call(this, attr);
  }

  /**
   * Start dynamic behavior associated with entity such as dynamic components and animations.
   * Tell all children entities to also play.
   */
  play () {
    var entities;
    var i;
    var key;

    // Already playing.
    if (this.isPlaying || (!this.hasLoaded && !this.isLoading)) { return; }
    this.isPlaying = true;

    // Wake up all components.
    for (key in this.components) { this.components[key].play(); }

    // Tell all child entities to play.
    entities = this.getChildEntities();
    for (i = 0; i < entities.length; i++) { entities[i].play(); }

    this.emit('play');
  }

  /**
   * Pause dynamic behavior associated with entity such as dynamic components and animations.
   * Tell all children entities to also pause.
   */
  pause () {
    var entities;
    var i;
    var key;

    if (!this.isPlaying) { return; }
    this.isPlaying = false;

    // Sleep all components.
    for (key in this.components) { this.components[key].pause(); }

    // Tell all child entities to pause.
    entities = this.getChildEntities();
    for (i = 0; i < entities.length; i++) { entities[i].pause(); }

    this.emit('pause');
  }

  /**
   * Deals with updates on entity-specific attributes (i.e., components and mixins).
   *
   * @param {string} attr
   * @param {string} oldVal
   * @param {string|object} newVal
   */
  setEntityAttribute (attr, oldVal, newVal) {
    if (COMPONENTS[attr] || this.components[attr]) {
      this.updateComponent(attr, newVal);
      return;
    }
    if (attr === 'mixin') {
      // Ignore if `<a-node>` code is just updating computed mixin in the DOM.
      if (newVal === this.computedMixinStr) { return; }
      this.mixinUpdate(newVal, oldVal);
    }
  }

  /**
   * When mixins updated, trigger init or optimized-update of relevant components.
   */
  mixinUpdate (newMixins, oldMixins, deferred) {
    var componentsUpdated = AEntity.componentsUpdated;

    var component;
    var mixinEl;
    var mixinIds;
    var i;
    var self = this;

    if (!deferred) { oldMixins = oldMixins || this.getAttribute('mixin'); }

    if (!this.hasLoaded) {
      this.addEventListener('loaded-private', function () {
        self.mixinUpdate(newMixins, oldMixins, true);
      }, ONCE);
      return;
    }

    mixinIds = this.updateMixins(newMixins, oldMixins);

    // Loop over current mixins.
    componentsUpdated.length = 0;
    for (i = 0; i < this.mixinEls.length; i++) {
      for (component in this.mixinEls[i].componentCache) {
        if (componentsUpdated.indexOf(component) === -1) {
          if (this.components[component]) {
            // Update. Just rebuild data.
            this.components[component].handleMixinUpdate();
          } else {
            // Init. buildData will gather mixin values.
            this.initComponent(component, null);
          }
          componentsUpdated.push(component);
        }
      }
    }

    // Loop over old mixins to call for data rebuild.
    for (i = 0; i < mixinIds.oldMixinIds.length; i++) {
      mixinEl = document.getElementById(mixinIds.oldMixinIds[i]);
      if (!mixinEl) { continue; }
      for (component in mixinEl.componentCache) {
        if (componentsUpdated.indexOf(component) === -1) {
          if (this.components[component]) {
            if (this.getDOMAttribute(component)) {
              // Update component if explicitly defined.
              this.components[component].handleMixinUpdate();
            } else {
              // Remove component if not explicitly defined.
              this.removeComponent(component, true);
            }
          }
        }
      }
    }
  }

  /**
   * setAttribute can:
   *
   * 1. Set a single property of a multi-property component.
   * 2. Set multiple properties of a multi-property component.
   * 3. Replace properties of a multi-property component.
   * 4. Set a value for a single-property component, mixin, or normal HTML attribute.
   *
   * @param {string} attrName - Component or attribute name.
   * @param {any} arg1 - Can be a value, property name, CSS-style property string, or
   *   object of properties.
   * @param {any} arg2 - If arg1 is a property name, this should be a value. Otherwise,
   *   it is a boolean indicating whether to clobber previous values (defaults to false).
   */
  setAttribute (attrName, arg1, arg2) {
    var singlePropUpdate = AEntity.singlePropUpdate;

    var newAttrValue;
    var clobber;
    var componentName;
    var delimiterIndex;
    var isDebugMode;
    var key;

    delimiterIndex = attrName.indexOf(MULTIPLE_COMPONENT_DELIMITER);
    componentName = delimiterIndex > 0 ? attrName.substring(0, delimiterIndex) : attrName;

    // Not a component. Normal set attribute.
    if (!COMPONENTS[componentName]) {
      if (attrName === 'mixin') { this.mixinUpdate(arg1); }
      super.setAttribute.call(this, attrName, arg1);
      return;
    }

    // Initialize component first if not yet initialized.
    if (!this.components[attrName] && this.hasAttribute(attrName)) {
      this.updateComponent(
        attrName,
        window.HTMLElement.prototype.getAttribute.call(this, attrName));
    }

    // Determine new attributes from the arguments
    if (typeof arg2 !== 'undefined' &&
        typeof arg1 === 'string' &&
        arg1.length > 0 &&
        typeof utils.styleParser.parse(arg1) === 'string') {
      // Update a single property of a multi-property component
      for (key in singlePropUpdate) { delete singlePropUpdate[key]; }
      newAttrValue = singlePropUpdate;
      newAttrValue[arg1] = arg2;
      clobber = false;
    } else {
      // Update with a value, object, or CSS-style property string, with the possibility
      // of clobbering previous values.
      newAttrValue = arg1;
      clobber = (arg2 === true);
    }

    // Update component
    this.updateComponent(attrName, newAttrValue, clobber);

    // In debug mode, write component data up to the DOM.
    isDebugMode = this.sceneEl && this.sceneEl.getAttribute('debug');
    if (isDebugMode) { this.components[attrName].flushToDOM(); }
  }

  /**
   * Reflect component data in the DOM (as seen from the browser DOM Inspector).
   *
   * @param {boolean} recursive - Also flushToDOM on the children.
   **/
  flushToDOM (recursive) {
    var components = this.components;
    var child;
    var children = this.children;
    var i;
    var key;

    // Flush entity's components to DOM.
    for (key in components) {
      components[key].flushToDOM();
    }

    // Recurse.
    if (!recursive) { return; }
    for (i = 0; i < children.length; ++i) {
      child = children[i];
      if (!child.flushToDOM) { continue; }
      child.flushToDOM(recursive);
    }
  }

  /**
   * If `attr` is a component, returns ALL component data including applied mixins and
   * defaults.
   *
   * If `attr` is not a component, fall back to HTML getAttribute.
   *
   * @param {string} attr
   * @returns {object|string} Object if component, else string.
   */
  getAttribute (attr) {
    // If component, return component data.
    var component;
    if (attr === 'position') { return this.object3D.position; }
    if (attr === 'rotation') { return getRotation(this); }
    if (attr === 'scale') { return this.object3D.scale; }
    if (attr === 'visible') { return this.object3D.visible; }
    component = this.components[attr];
    if (component) { return component.data; }
    return window.HTMLElement.prototype.getAttribute.call(this, attr);
  }

  /**
   * If `attr` is a component, returns JUST the component data defined on the entity.
   * Like a partial version of `getComputedAttribute` as returned component data
   * does not include applied mixins or defaults.
   *
   * If `attr` is not a component, fall back to HTML getAttribute.
   *
   * @param {string} attr
   * @returns {object|string} Object if component, else string.
   */
  getDOMAttribute (attr) {
    // If cached value exists, return partial component data.
    var component = this.components[attr];
    if (component) { return component.attrValue; }
    return window.HTMLElement.prototype.getAttribute.call(this, attr);
  }

  addState (state) {
    if (this.is(state)) { return; }
    this.states.push(state);
    this.emit('stateadded', state);
  }

  removeState (state) {
    var stateIndex = this.states.indexOf(state);
    if (stateIndex === -1) { return; }
    this.states.splice(stateIndex, 1);
    this.emit('stateremoved', state);
  }

  /**
   * Checks if the element is in a given state. e.g. el.is('alive');
   *
   * @param {string} state - Name of the state we want to check
   */
  is (state) {
    return this.states.indexOf(state) !== -1;
  }

  /**
   * Open Inspector to this entity.
   */
  inspect () {
    this.sceneEl.components.inspector.openInspector(this);
  }

  /**
   * Clean up memory and return memory to object pools.
   */
  destroy () {
    var key;
    if (this.parentNode) {
      warn('Entity can only be destroyed if detached from scenegraph.');
      return;
    }
    for (key in this.components) {
      this.components[key].destroy();
    }
  }
}

/**
 * Check if a component is *defined* for an entity, including defaults and mixins.
 * Does not check whether the component has been *initialized* for an entity.
 *
 * @param {string} el - Entity.
 * @param {string} name - Component name.
 * @returns {boolean}
 */
function checkComponentDefined (el, name) {
  // Check if element contains the component.
  if (el.components[name] && el.components[name].attrValue) { return true; }

  return isComponentMixedIn(name, el.mixinEls);
}

/**
 * Check if any mixins contains a component.
 *
 * @param {string} name - Component name.
 * @param {Array<Element>} mixinEls - Array of <a-mixin>s.
 */
function isComponentMixedIn (name, mixinEls) {
  var i;
  var inMixin = false;
  for (i = 0; i < mixinEls.length; ++i) {
    inMixin = mixinEls[i].hasAttribute(name);
    if (inMixin) { break; }
  }
  return inMixin;
}

/**
 * Given entity defined value, merge in extra data if necessary.
 * Handle both single and multi-property components.
 *
 * @param {string} attrValue - Entity data.
 * @param extraData - Entity data from another source to merge in.
 */
function mergeComponentData (attrValue, extraData) {
  // Extra data not defined, just return attrValue.
  if (!extraData) { return attrValue; }

  // Merge multi-property data.
  if (extraData.constructor === Object) {
    return utils.extend(extraData, utils.styleParser.parse(attrValue || {}));
  }

  // Return data, precedence to the defined value.
  return attrValue || extraData;
}

function isComponent (componentName) {
  if (componentName.indexOf(MULTIPLE_COMPONENT_DELIMITER) !== -1) {
    componentName = utils.split(componentName, MULTIPLE_COMPONENT_DELIMITER)[0];
  }
  if (!COMPONENTS[componentName]) { return false; }
  return true;
}

function getRotation (entityEl) {
  var radToDeg = THREE.MathUtils.radToDeg;
  var rotation = entityEl.object3D.rotation;
  var rotationObj = entityEl.rotationObj;
  rotationObj.x = radToDeg(rotation.x);
  rotationObj.y = radToDeg(rotation.y);
  rotationObj.z = radToDeg(rotation.z);
  return rotationObj;
}

AEntity.componentsUpdated = [];
AEntity.singlePropUpdate = {};

customElements.define('a-entity', AEntity);
