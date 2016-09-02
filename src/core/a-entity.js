/* global HTMLElement */
var ANode = require('./a-node');
var COMPONENTS = require('./component').components;
var registerElement = require('./a-register-element').registerElement;
var THREE = require('../lib/three');
var utils = require('../utils/');
var bind = utils.bind;

var AEntity;
var debug = utils.debug('core:a-entity:debug');

var MULTIPLE_COMPONENT_DELIMITER = '__';

/**
 * Entity is a container object that components are plugged into to comprise everything in
 * the scene. In A-Frame, they inherently have position, rotation, and scale.
 *
 * To be able to take components, the scene element inherits from the entity definition.
 *
 * @member {object} components - entity's currently initialized components.
 * @member {object} object3D - three.js object.
 * @member {array} states
 * @member {boolean} isPlaying - false if dynamic behavior of the entity is paused.
 */
var proto = Object.create(ANode.prototype, {
  defaultComponents: {
    value: {
      position: '',
      rotation: '',
      scale: '',
      visible: ''
    }
  },

  createdCallback: {
    value: function () {
      this.components = {};
      this.isEntity = true;
      this.isPlaying = false;
      this.object3D = new THREE.Group();
      this.object3D.el = this;
      this.object3DMap = {};
      this.parentEl = null;
      this.states = [];
    }
  },

  /**
   * Handle changes coming from the browser DOM inspector.
   */
  attributeChangedCallback: {
    value: function (attr, oldVal, newVal) {
      var component = this.components[attr];
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
  },

  /**
   * Add to parent, load, play.
   */
  attachedCallback: {
    value: function () {
      var assetsEl;  // Asset management system element.
      var sceneEl = this.sceneEl;
      var self = this;  // Component.

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
  },

  /**
   * Tell parent to remove this element's object3D from its object3D.
   * Do not call on scene element because that will cause a call to document.body.remove().
   */
  detachedCallback: {
    value: function () {
      if (!this.parentEl || this.isScene) { return; }
      // Remove components.
      Object.keys(this.components).forEach(bind(this.removeComponent, this));
      this.removeFromParent();
      ANode.prototype.detachedCallback.call(this);
    }
  },

  /**
   * Apply mixin to component.
   */
  handleMixinUpdate: {
    value: function (attrName) {
      if (!attrName) {
        this.updateComponents();
        return;
      }
      this.updateComponent(attrName, this.getAttribute(attrName));
    }
  },

  mapStateMixins: {
    value: function (state, op) {
      var mixins = this.getAttribute('mixin');
      var mixinIds;
      if (!mixins) { return; }
      mixinIds = mixins.split(' ');
      mixinIds.forEach(function (id) {
        var mixinId = id + '-' + state;
        op(mixinId);
      });
      this.updateComponents();
    }
  },

  updateStateMixins: {
    value: function (newMixins, oldMixins) {
      var self = this;
      oldMixins = oldMixins || '';
      var newMixinsIds = newMixins.split(' ');
      var oldMixinsIds = oldMixins ? oldMixins.split(' ') : [];
      // The list of mixins that might have been removed on update
      var diff = oldMixinsIds.filter(function (i) { return newMixinsIds.indexOf(i) < 0; });
      // Remove the mixins that are gone on update
      diff.forEach(function (mixinId) {
        var forEach = Array.prototype.forEach;
        // State Mixins
        var stateMixinsEls = document.querySelectorAll('[id^=' + mixinId + '-]');
        forEach.call(stateMixinsEls, function (el) {
          self.unregisterMixin(el.id);
        });
      });
      this.states.forEach(function (state) {
        newMixinsIds.forEach(function (id) {
          var mixinId = id + '-' + state;
          self.registerMixin(mixinId);
        });
      });
    }
  },

  getObject3D: {
    value: function (type) {
      return this.object3DMap[type];
    }
  },

  setObject3D: {
    value: function (type, obj) {
      var self = this;
      var oldObj = this.object3DMap[type];
      if (oldObj) { this.object3D.remove(oldObj); }
      if (obj instanceof THREE.Object3D) {
        obj.el = self;
        this.object3D.add(obj);
        if (obj.children.length) {
          obj.traverse(function bindEl (child) {
            child.el = self;
          });
        }
      }
      this.object3DMap[type] = obj;
    }
  },

  removeObject3D: {
    value: function (type) {
      this.setObject3D(type, null);
    }
  },

  /**
   * Gets or creates an object3D of a given type.

   * @param {string} type - Type of the object3D.
   * @param {string} Constructor - Constructor to use if need to create the object3D.
   * @type {Object}
   */
  getOrCreateObject3D: {
    value: function (type, Constructor) {
      var object3D = this.getObject3D(type);
      if (!object3D && Constructor) {
        object3D = new Constructor();
        this.setObject3D(type, object3D);
      }
      return object3D;
    }
  },
   /**
   * Add child entity.
   *
   * @param {Element} el - Child entity.
   */
  add: {
    value: function (el) {
      if (!el.object3D) {
        throw new Error("Trying to add an element that doesn't have an `object3D`");
      }
      this.object3D.add(el.object3D);
      this.emit('child-attached', { el: el });
    }
  },

  /**
   * Tell parentNode to add this entity to itself.
   */
  addToParent: {
    value: function () {
      var parentNode = this.parentEl = this.parentNode;

      // `!parentNode` check primarily for unit tests.
      if (!parentNode || !parentNode.add || this.attachedToParent) { return; }

      parentNode.add(this);
      this.attachedToParent = true;  // To prevent multiple attachments to same parent.
    }
  },

  /**
   * Tell parentNode to remove this entity from itself.
   */
  removeFromParent: {
    value: function () {
      var parentEl = this.parentEl;
      this.parentEl.remove(this);
      this.attachedToParent = false;
      this.parentEl = this.parentNode = null;
      parentEl.emit('child-detached', {el: this});
    }
  },

  load: {
    value: function () {
      var self = this;

      if (this.hasLoaded) { return; }

      ANode.prototype.load.call(this, entityLoadCallback);
      // Entity load.
      function entityLoadCallback () {
        self.updateComponents();
        if (self.isScene || self.parentEl.isPlaying) { self.play(); }
      }
    },
    writable: window.debug
  },

  /**
   * Remove child entity.
   *
   * @param {Element} el - Child entity.
   */
  remove: {
    value: function (el) {
      this.object3D.remove(el.object3D);
    }
  },

  /**
   * @returns {array} Direct children that are entities.
   */
  getChildEntities: {
    value: function () {
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
  },

  /**
   * Initialize component.
   *
   * @param {string} attrName - Attribute name asociated to the component.
   * @param {object} data - Component data
   * @param {boolean} isDependency - True if the component is a dependency.
   */
  initComponent: {
    value: function (attrName, data, isDependency) {
      var component;
      var componentInfo = attrName.split(MULTIPLE_COMPONENT_DELIMITER);
      var componentId = componentInfo[1];
      var componentName = componentInfo[0];
      var isComponentDefined = checkComponentDefined(this, attrName) || data !== undefined;
      // Check if component is registered and whether component should be initialized.
      if (!COMPONENTS[componentName] ||
          (!isComponentDefined && !isDependency) ||
          // If component already initialized.
          (attrName in this.components)) {
        return;
      }

      // Initialize dependencies first
      this.initComponentDependencies(componentName);

      // If component name has an id we check component type multiplic
      if (componentId && !COMPONENTS[componentName].multiple) {
        throw new Error('Trying to initialize multiple ' +
                        'components of type `' + componentName +
                        '`. There can only be one component of this type per entity.');
      }
      component = this.components[attrName] = new COMPONENTS[componentName].Component(
        this, data, componentId);
      if (this.isPlaying) { component.play(); }

      // Components are reflected in the DOM as attributes but the state is not shown
      // hence we set the attribute to empty string.
      // The flag justInitialized is for attributeChangedCallback to not overwrite
      // the component with the empty string.
      if (!this.hasAttribute(attrName)) {
        component.justInitialized = true;
        HTMLElement.prototype.setAttribute.call(this, attrName, '');
      }

      debug('Component initialized: %s', attrName);
    },
    writable: window.debug
  },

  initComponentDependencies: {
    value: function (name) {
      var self = this;
      var component = COMPONENTS[name];
      var dependencies;
      if (!component) { return; }
      dependencies = COMPONENTS[name].dependencies;
      if (!dependencies) { return; }
      dependencies.forEach(function (component) {
        self.initComponent(component, undefined, true);
      });
    }
  },

  removeComponent: {
    value: function (name) {
      var component = this.components[name];
      var isDefault = name in this.defaultComponents;
      var isMixedIn = isComponentMixedIn(name, this.mixinEls);
      // Don't remove default or mixed in components
      if (isDefault || isMixedIn) { return; }
      component.pause();
      component.remove();
      delete this.components[name];
      this.emit('componentremoved', { name: name });
    }
  },

  /**
   * Update all components.
   * Build data using defined attributes, mixins, and defaults.
   * Update default components before the rest.
   */
  updateComponents: {
    value: function () {
      var elComponents = {};
      var self = this;
      var i;
      if (!this.hasLoaded) { return; }

      // Gather entity-defined components.
      var attributes = this.attributes;
      for (i = 0; i < attributes.length; ++i) {
        addComponent(attributes[i].name);
      }

      // Gather mixin-defined components.
      getMixedInComponents(this).forEach(addComponent);

      // Set default components.
      Object.keys(this.defaultComponents).forEach(updateComponent);

      // Set rest of components.
      Object.keys(elComponents).forEach(updateComponent);

      /**
       * Add component to the list.
       */
      function addComponent (key) {
        var name = key.split(MULTIPLE_COMPONENT_DELIMITER)[0];
        if (!COMPONENTS[name]) { return; }
        elComponents[key] = true;
      }

      /**
       * Update component with given name.
       */
      function updateComponent (name) {
        var attrValue = self.getAttribute(name);
        delete elComponents[name];
        self.updateComponent(name, attrValue);
      }
    }
  },

  /**
   * Initialize, update, or remove a single component.
   *
   * When initializing, we set the component on `this.components`.
   *
   * @param {string} attr - Component name.
   * @param {object} attrValue - The value of the DOM attribute.
   */
  updateComponent: {
    value: function (attr, attrValue) {
      var component = this.components[attr];
      var isDefault = attr in this.defaultComponents;
      if (component) {
        if (attrValue === null && !isDefault) {
          this.removeComponent(attr);
          return;
        }
        // Component already initialized. Update component.
        component.updateProperties(attrValue);
        return;
      }
      // Component not yet initialized. Initialize component.
      this.initComponent(attr, attrValue, false);
    }
  },

  /**
   * Updates one property of the component
   *
   * @param {string} name - Component name
   * @param {string} property - Component property name
   * @param {any} propertyValue - New property value
   */
  updateComponentProperty: {
    value: function (name, property, propertyValue) {
      var component = this.components[name];
      // Cached attribute value
      var attrValue = component && component.attrValue;
      // Copy cached value
      var componentObj = attrValue ? utils.extend({}, attrValue) : {};
      componentObj[property] = propertyValue;
      this.updateComponent(name, componentObj);
    }
  },

  /**
   * If `attr` is a component name, removeAttribute detaches the component from the
   * entity.
   *
   * @param {string} attr - Attribute name, which could also be a component name.
   */
  removeAttribute: {
    value: function (attr) {
      var component = this.components[attr];
      if (component) {
        this.setEntityAttribute(attr, undefined, null);
        // The component might not be removed if it's a default one
        if (this.components[attr]) { return; }
      }
      HTMLElement.prototype.removeAttribute.call(this, attr);
    }
  },

  /**
   * Start dynamic behavior associated with entity such as dynamic components and animations.
   * Tell all children entities to also play.
   */
  play: {
    value: function () {
      var components = this.components;
      var componentKeys = Object.keys(components);

      // Already playing.
      if (this.isPlaying || !this.hasLoaded) { return; }
      this.isPlaying = true;

      // Wake up all components.
      componentKeys.forEach(function playComponent (key) {
        components[key].play();
      });

      // Tell all child entities to play.
      this.getChildEntities().forEach(function play (entity) {
        entity.play();
      });

      this.emit('play');
    },
    writable: true
  },

  /**
   * Pause dynamic behavior associated with entity such as dynamic components and animations.
   * Tell all children entities to also pause.
   */
  pause: {
    value: function () {
      var components = this.components;
      var componentKeys = Object.keys(components);

      if (!this.isPlaying) { return; }
      this.isPlaying = false;

      // Sleep all components.
      componentKeys.forEach(function pauseComponent (key) {
        components[key].pause();
      });

      // Tell all child entities to pause.
      this.getChildEntities().forEach(function pause (obj) {
        obj.pause();
      });

      this.emit('pause');
    },
    writable: true
  },

  /**
   * Deals with updates on entity-specific attributes (i.e., components and mixins).
   *
   * @param {string} attr
   * @param {string} oldVal
   * @param {string|object} newVal
   */
  setEntityAttribute: {
    value: function (attr, oldVal, newVal) {
      if (COMPONENTS[attr] || this.components[attr]) {
        this.updateComponent(attr, newVal);
        return;
      }
      if (attr === 'mixin') {
        this.mixinUpdate(newVal, oldVal);
        return;
      }
    }
  },

  mixinUpdate: {
    value: function (newMixins, oldMixins) {
      oldMixins = oldMixins || this.getAttribute('mixin');
      this.updateStateMixins(newMixins, oldMixins);
      this.updateComponents();
    }
  },

  /**
   * If attribute is a component, setAttribute will apply the value to the
   * existing component data, not replace it. Examples:
   *
   * Examples:
   *
   * setAttribute('id', 'my-element');
   * setAttribute('material', { color: 'crimson' });
   * setAttribute('material', 'color', 'crimson');
   *
   * @param {string} attr - Attribute name. setAttribute will initialize or update
   *        a component if the name corresponds to a registered component.
   * @param {string|object} value - If a string, setAttribute will update the attribute or.
   *        component. If an object, the value will be mixed into the component.
   * @param {string} componentPropValue - If defined, `value` will act as the property
   *        name and setAttribute will only set a single component property.
   */
  setAttribute: {
    value: function (attr, value, componentPropValue) {
      var isDebugMode = this.sceneEl && this.sceneEl.getAttribute('debug');
      var componentName = attr.split(MULTIPLE_COMPONENT_DELIMITER)[0];
      if (COMPONENTS[componentName]) {
        // Just update one of the component properties
        if (typeof value === 'string' && componentPropValue !== undefined) {
          this.updateComponentProperty(attr, value, componentPropValue);
        } else {
          this.updateComponent(attr, value);
        }
        // On debug mode we write the component state to the DOM attributes
        if (isDebugMode) { this.components[attr].flushToDOM(); }
        return;
      }

      ANode.prototype.setAttribute.call(this, attr, value);
      if (attr === 'mixin') { this.mixinUpdate(value); }
    },
    writable: window.debug
  },

  /**
   * To make the DOM attributes reflect the state of the components.
   *
   * @param {bool} recursive - Call updateDOM on the children
   **/
  flushToDOM: {
    value: function (recursive) {
      var components = this.components;
      var children = this.children;
      var child;
      var i;
      Object.keys(components).forEach(updateDOMAtrribute);
      if (!recursive) { return; }
      for (i = 0; i < children.length; ++i) {
        child = children[i];
        if (!child.flushToDOM) { continue; }
        child.flushToDOM(recursive);
      }
      function updateDOMAtrribute (name) { components[name].flushToDOM(); }
    }
  },

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
  getAttribute: {
    value: function (attr) {
      // If cached value exists, return partial component data.
      var component = this.components[attr];
      if (component) { return component.attrValue; }
      return HTMLElement.prototype.getAttribute.call(this, attr);
    },
    writable: window.debug
  },

  /**
   * If `attr` is a component, returns ALL component data including applied mixins and
   * defaults.
   *
   * If `attr` is not a component, fall back to HTML getAttribute.
   *
   * @param {string} attr
   * @returns {object|string} Object if component, else string.
   */
  getComputedAttribute: {
    value: function (attr) {
      // If component, return component data.
      var component = this.components[attr];
      if (component) { return component.getData(); }
      return HTMLElement.prototype.getAttribute.call(this, attr);
    }
  },

  addState: {
    value: function (state) {
      if (this.is(state)) { return; }
      this.states.push(state);
      this.mapStateMixins(state, bind(this.registerMixin, this));
      this.emit('stateadded', {state: state});
    }
  },

  removeState: {
    value: function (state) {
      var stateIndex = this.states.indexOf(state);
      if (stateIndex === -1) { return; }
      this.states.splice(stateIndex, 1);
      this.mapStateMixins(state, bind(this.unregisterMixin, this));
      this.emit('stateremoved', {state: state});
    }
  },

  /**
   * Checks if the element is in a given state. e.g. el.is('alive');
   * @type {string} state - Name of the state we want to check
   */
  is: {
    value: function (state) {
      return this.states.indexOf(state) !== -1;
    }
  }
});

/**
 * Check if a component is *defined* for an entity, including defaults and mixins.
 * Does not check whether the component has been *initialized* for an entity.
 *
 * @param {string} el - Entity.
 * @param {string} name - Component name.
 * @returns {boolean}
 */
function checkComponentDefined (el, name) {
  // Check if default components contain the component.
  if (el.defaultComponents[name] !== undefined) { return true; }

  // Check if element contains the component.
  if (el.components[name] && el.components[name].attrValue) { return true; }

  return isComponentMixedIn(name, el.mixinEls);
}

function getMixedInComponents (entityEl) {
  var components = [];
  entityEl.mixinEls.forEach(function getMixedComponents (mixinEl) {
    Object.keys(mixinEl.componentCache).forEach(addComponent);
    function addComponent (key) {
      components.push(key);
    }
  });
  return components;
}

/**
 * Check if any mixins contains a component.
 *
 * @param {string} name - Component name.
 * @param {array} mixinEls - Array of <a-mixin>s.
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

AEntity = registerElement('a-entity', {
  prototype: proto
});
module.exports = AEntity;
