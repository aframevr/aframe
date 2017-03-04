/* global HTMLElement */
var ANode = require('./a-node');
var COMPONENTS = require('./component').components;
var registerElement = require('./a-register-element').registerElement;
var THREE = require('../lib/three');
var utils = require('../utils/');

var AEntity;
var bind = utils.bind;
var debug = utils.debug('core:a-entity:debug');
var warn = utils.debug('core:a-entity:warn');

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
      // to avoid double initializations and infinite loops
      this.initializingComponents = {};
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
      if (!this.parentEl) { return; }

      // Remove components.
      Object.keys(this.components).forEach(bind(this.removeComponent, this));

      if (this.isScene) { return; }

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
      this.updateComponent(attrName, this.getDOMAttribute(attrName));
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

  /**
   * Set a THREE.Object3D into the map.
   *
   * @param {string} type - Developer-set name of the type of object, will be unique per type.
   * @param {object} obj - A THREE.Object3D.
   */
  setObject3D: {
    value: function (type, obj) {
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
  },

  /**
   * Remove object from scene and entity object3D map.
   */
  removeObject3D: {
    value: function (type) {
      var obj = this.getObject3D(type);
      if (!obj) {
        warn('Tried to remove `Object3D` of type:', type, 'which was not defined.');
        return;
      }
      this.object3D.remove(obj);
      delete this.object3DMap[type];
      this.emit('object3dremove', {type: type});
    }
  },

  /**
   * Gets or creates an object3D of a given type.
   *
   * @param {string} type - Type of the object3D.
   * @param {string} Constructor - Constructor to use to create the object3D if needed.
   * @returns {object}
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

      ANode.prototype.load.call(this, function entityLoadCallback () {
        self.updateComponents();
        if (self.isScene || self.parentEl.isPlaying) { self.play(); }
      });
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

      // Not a registered component.
      if (!COMPONENTS[componentName]) { return; }

      // Component is not a dependency and is undefined.
      // If a component is a dependency, then it is okay to have no data.
      if (!isComponentDefined && !isDependency) { return; }

      // Component already initialized.
      if (attrName in this.components) { return; }

      // Initialize dependencies first
      this.initComponentDependencies(componentName);

      // If component name has an id we check component type multiplic
      if (componentId && !COMPONENTS[componentName].multiple) {
        throw new Error('Trying to initialize multiple ' +
                        'components of type `' + componentName +
                        '`. There can only be one component of this type per entity.');
      }
      component = new COMPONENTS[componentName].Component(this, data, componentId);
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

  /**
   * Initialize dependencies of a component.
   *
   * @param {string} name - Root component name.
   */
  initComponentDependencies: {
    value: function (name) {
      var self = this;
      var component = COMPONENTS[name];
      var dependencies;

      // Not a component.
      if (!component) { return; }

      // No dependencies.
      dependencies = COMPONENTS[name].dependencies;

      if (!dependencies) { return; }

      // Initialize dependencies.
      dependencies.forEach(function initializeDependency (componentName) {
        // Call getAttribute to initialize the data from the DOM.
        self.initComponent(
          componentName,
          HTMLElement.prototype.getAttribute.call(self, componentName) || undefined,
          true
        );
      });
    }
  },

  removeComponent: {
    value: function (name) {
      var component;
      var isDefault;
      var isMixedIn;

      // Don't remove default or mixed-in components.
      isDefault = name in this.defaultComponents;
      isMixedIn = isComponentMixedIn(name, this.mixinEls);
      if (isDefault || isMixedIn) { return; }

      component = this.components[name];
      component.pause();
      component.remove();
      delete this.components[name];
      this.emit('componentremoved', {
        id: component.id,
        name: name
      });
    }
  },

  /**
   * Initialize or update all components.
   * Build data using initial components, defined attributes, mixins, and defaults.
   * Update default components before the rest.
   *
   * @member {function} getExtraComponents - Can be implemented to include component data
   *   from other sources (e.g., implemented by primitives).
   */
  updateComponents: {
    value: function () {
      var componentsToUpdate = {};
      var extraComponents = {};
      var i;
      var self = this;

      if (!this.hasLoaded) { return; }

      // Gather mixin-defined components.
      getMixedInComponents(this).forEach(addComponent);

      // Gather from extra initial component data if defined (e.g., primitives).
      if (this.getExtraComponents) {
        extraComponents = this.getExtraComponents();
        Object.keys(extraComponents).forEach(addComponent);
      }

      // Gather entity-defined components.
      for (i = 0; i < this.attributes.length; ++i) {
        addComponent(this.attributes[i].name);
      }

      // Initialze or update default components first.
      Object.keys(this.defaultComponents).forEach(doUpdateComponent);

      // Initialize or update rest of components.
      Object.keys(componentsToUpdate).forEach(doUpdateComponent);

      /**
       * Add component to the list to initialize or update.
       */
      function addComponent (componentName) {
        var name = componentName.split(MULTIPLE_COMPONENT_DELIMITER)[0];
        if (!COMPONENTS[name]) { return; }
        componentsToUpdate[componentName] = true;
      }

      /**
       * Get component data and initialize or update component.
       */
      function doUpdateComponent (name) {
        // Build defined component data.
        var data = mergeComponentData(self.getDOMAttribute(name), extraComponents[name]);
        delete componentsToUpdate[name];
        self.updateComponent(name, data);
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
   * If `attr` is a component name, detach the component from the entity.
   *
   * If `propertyName` is given, reset the component property value to its default.
   *
   * @param {string} attr - Attribute name, which could also be a component name.
   * @param {string} propertyName - Component prop name, if resetting an individual prop.
   */
  removeAttribute: {
    value: function (attr, propertyName) {
      var component = this.components[attr];

      // Remove component.
      if (component && propertyName === undefined) {
        this.setEntityAttribute(attr, undefined, null);
        // Do not remove the component from the DOM if default component.
        if (this.components[attr]) { return; }
      }

      // Reset component property value.
      if (component && propertyName !== undefined) {
        component.resetProperty(propertyName);
        return;
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
   * setAttribute can:
   *
   * 1. Set a single property of a multi-property component.
   * 2. Set multiple properties of a multi-property component.
   * 3. Replace properties of a multi-property component.
   * 4. Set a value for a single-property component, mixin, or normal HTML attribute.
   *
   * @param {string} attrName - Component or attribute name.
   * @param {string|object} arg1 - Can be a property name or object of properties.
   * @param {string|bool} arg2 - Can be a value, or boolean indicating whether to update or
   *   replace.
   */
  setAttribute: {
    value: function (attrName, arg1, arg2) {
      var componentName;
      var isDebugMode;

      // Determine which type of setAttribute to call based on the types of the arguments.
      componentName = attrName.split(MULTIPLE_COMPONENT_DELIMITER)[0];
      if (COMPONENTS[componentName]) {
        if (typeof arg1 === 'string' && typeof arg2 !== 'undefined') {
          singlePropertyUpdate(this, attrName, arg1, arg2);
        } else if (typeof arg1 === 'object' && arg2 === true) {
          multiPropertyClobber(this, attrName, arg1);
        } else {
          componentUpdate(this, attrName, arg1);
        }

        // In debug mode, write component data up to the DOM.
        isDebugMode = this.sceneEl && this.sceneEl.getAttribute('debug');
        if (isDebugMode) { this.components[attrName].flushToDOM(); }
        return;
      } else {
        normalSetAttribute(this, attrName, arg1);
      }

      /**
       * Just update one of the component properties.
       * >> setAttribute('foo', 'bar', 'baz')
       */
      function singlePropertyUpdate (el, componentName, propName, propertyValue) {
        el.updateComponentProperty(componentName, propName, propertyValue);
      }

      /**
       * Just update multiple component properties at once for a multi-property component.
       * >> setAttribute('foo', {bar: 'baz'})
       */
      function componentUpdate (el, componentName, propValue) {
        var component = el.components[componentName];
        if (component && typeof propValue === 'object') {
          // Extend existing component attribute value.
          el.updateComponent(
            componentName,
            utils.extendDeep(utils.extendDeep({}, component.attrValue), propValue));
        } else {
          el.updateComponent(componentName, propValue);
        }
      }

      /**
       * Pass in complete data set for a multi-property component.
       * >> setAttribute('foo', {bar: 'baz'}, true)
       */
      function multiPropertyClobber (el, componentName, propObject) {
        el.updateComponent(componentName, propObject);
      }

      /**
       * Just update one of the component properties.
       * >> setAttribute('id', 'myEntity')
       */
      function normalSetAttribute (el, attrName, value) {
        ANode.prototype.setAttribute.call(el, attrName, value);
        if (attrName === 'mixin') { el.mixinUpdate(value); }
      }
    },
    writable: window.debug
  },

  /**
   * Reflect component data in the DOM (as seen from the browser DOM Inspector).
   *
   * @param {bool} recursive - Also flushToDOM on the children.
   **/
  flushToDOM: {
    value: function (recursive) {
      var components = this.components;
      var defaultComponents = this.defaultComponents;
      var child;
      var children = this.children;
      var i;

      // Flush entity's components to DOM.
      Object.keys(components).forEach(function flushComponent (componentName) {
        components[componentName].flushToDOM(componentName in defaultComponents);
      });

      // Recurse.
      if (!recursive) { return; }
      for (i = 0; i < children.length; ++i) {
        child = children[i];
        if (!child.flushToDOM) { continue; }
        child.flushToDOM(recursive);
      }
    }
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
  getAttribute: {
    value: function (attr) {
      // If component, return component data.
      var component = this.components[attr];
      if (component) { return component.getData(); }
      return HTMLElement.prototype.getAttribute.call(this, attr);
    },
    writable: window.debug
  },

  /**
   * `getAttribute` used to be `getDOMAttribute` and `getComputedAttribute` used to be
   * what `getAttribute` is now. Now legacy code.
   *
   * @param {string} attr
   * @returns {object|string} Object if component, else string.
   */
  getComputedAttribute: {
    value: function (attr) {
      warn('`getComputedAttribute` is deprecated. Use `getAttribute` instead.');
      return this.getAttribute(attr);
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
  getDOMAttribute: {
    value: function (attr) {
      // If cached value exists, return partial component data.
      var component = this.components[attr];
      if (component) { return component.attrValue; }
      return HTMLElement.prototype.getAttribute.call(this, attr);
    },
    writable: window.debug
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

  // Return data, precendence to the defined value.
  return attrValue || extraData;
}

AEntity = registerElement('a-entity', {
  prototype: proto
});
module.exports = AEntity;
