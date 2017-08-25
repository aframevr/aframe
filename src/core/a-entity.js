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
      // To avoid double initializations and infinite loops.
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
      var componentName;

      if (!this.parentEl) { return; }

      // Remove components.
      for (componentName in this.components) { this.removeComponent(componentName); }

      if (this.isScene) { return; }

      this.removeFromParent();
      ANode.prototype.detachedCallback.call(this);

      // Remove cyclic reference.
      this.object3D.el = null;
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

  /**
   * Add new mixin for each mixin with state suffix.
   */
  mapStateMixins: {
    value: function (state, op) {
      var mixins;
      var mixinIds;
      var i;

      mixins = this.getAttribute('mixin');

      if (!mixins) { return; }
      mixinIds = mixins.split(' ');
      for (i = 0; i < mixinIds.length; i++) {
        op(mixinIds[i] + '-' + state);
      }
      this.updateComponents();
    }
  },

  /**
   * Handle update of mixin states (e.g., `box-hovered` where `box` is the mixin ID and
   * `hovered` is the entity state.
   */
  updateStateMixins: {
    value: function (newMixins, oldMixins) {
      var diff;
      var newMixinIds;
      var oldMixinIds;
      var i;
      var j;
      var stateMixinEls;

      newMixinIds = newMixins.split(' ');
      oldMixinIds = (oldMixins || '') ? oldMixins.split(' ') : [];

      // List of mixins that might have been removed on update.
      diff = oldMixinIds.filter(function (i) { return newMixinIds.indexOf(i) < 0; });

      // Remove removed mixins.
      for (i = 0; i < diff.length; i++) {
        stateMixinEls = document.querySelectorAll('[id^=' + diff[i] + '-]');
        for (j = 0; j < stateMixinEls.length; j++) {
          this.unregisterMixin(stateMixinEls[j].id);
        }
      }

      // Add new mixins.
      for (i = 0; i < this.states.length; i++) {
        for (j = 0; j < newMixinIds.length; j++) {
          this.registerMixin(newMixinIds[j] + '-' + this.states[i]);
        }
      }
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
      this.emit('child-attached', {el: el});
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

      if (this.hasLoaded || !this.parentEl) { return; }

      ANode.prototype.load.call(this, function entityLoadCallback () {
        // Check if entity was detached while it was waiting to load.
        if (!self.parentEl) { return; }

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
        window.HTMLElement.prototype.setAttribute.call(this, attrName, '');
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
      if (!component) { return; }

      // Wait for component to initialize.
      if (!component.initialized) {
        this.addEventListener('componentinitialized', function tryRemoveLater (evt) {
          if (evt.detail.name !== name) { return; }
          this.removeComponent(name);
          this.removeEventListener('componentinitialized', tryRemoveLater);
        });
        return;
      }

      component.pause();
      component.remove();
      delete this.components[name];
      this.emit('componentremoved', component.evtDetail);
    },
    writable: window.debug
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
    value: (function () {
      var componentsToUpdate = {};

      return function () {
        var data;
        var extraComponents;
        var i;
        var name;

        if (!this.hasLoaded) { return; }

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
          if (isComponent(name)) { componentsToUpdate[name] = true; }
        }

        // Initialze or update default components first.
        for (name in this.defaultComponents) {
          data = mergeComponentData(this.getDOMAttribute(name),
                                    extraComponents && extraComponents[name]);
          this.updateComponent(name, data);
          delete componentsToUpdate[name];
        }

        // Initialize or update rest of components.
        for (name in componentsToUpdate) {
          data = mergeComponentData(this.getDOMAttribute(name),
                                    extraComponents && extraComponents[name]);
          this.updateComponent(name, data);
          delete componentsToUpdate[name];
        }
      };
    })(),
    writable: window.debug
  },

  /**
   * Initialize, update, or remove a single component.
   *
   * When initializing, we set the component on `this.components`.
   *
   * @param {string} attr - Component name.
   * @param {object} attrValue - Value of the DOM attribute.
   * @param {boolean} clobber - If new attrValue completely replaces previous properties.
   */
  updateComponent: {
    value: function (attr, attrValue, clobber) {
      var component = this.components[attr];
      var isDefault = attr in this.defaultComponents;
      if (component) {
        // Remove component.
        if (attrValue === null && !isDefault) {
          this.removeComponent(attr);
          return;
        }
        // Component already initialized. Update component.
        component.updateProperties(attrValue, clobber);
        return;
      }

      // Component not yet initialized. Initialize component.
      this.initComponent(attr, attrValue, false);
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

      // Remove mixins.
      if (attr === 'mixin') {
        this.mixinUpdate('');
      }

      window.HTMLElement.prototype.removeAttribute.call(this, attr);
    }
  },

  /**
   * Start dynamic behavior associated with entity such as dynamic components and animations.
   * Tell all children entities to also play.
   */
  play: {
    value: function () {
      var entities;
      var i;
      var key;

      // Already playing.
      if (this.isPlaying || !this.hasLoaded) { return; }
      this.isPlaying = true;

      // Wake up all components.
      for (key in this.components) { this.components[key].play(); }

      // Tell all child entities to play.
      entities = this.getChildEntities();
      for (i = 0; i < entities.length; i++) { entities[i].play(); }

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
      this.updateMixins(newMixins, oldMixins);
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
   * @param {*} arg1 - Can be a value, property name, CSS-style property string, or
   *   object of properties.
   * @param {*|bool} arg2 - If arg1 is a property name, this should be a value. Otherwise,
   *   it is a boolean indicating whether to clobber previous values (defaults to false).
   */
  setAttribute: {
    value: function (attrName, arg1, arg2) {
      var newAttrValue;
      var clobber;
      var componentName;
      var delimiterIndex;
      var isDebugMode;

      delimiterIndex = attrName.indexOf(MULTIPLE_COMPONENT_DELIMITER);
      componentName = delimiterIndex > 0 ? attrName.substring(0, delimiterIndex) : attrName;

      // Not a component. Normal set attribute.
      if (!COMPONENTS[componentName]) {
        ANode.prototype.setAttribute.call(this, attrName, arg1);
        if (attrName === 'mixin') { this.mixinUpdate(arg1); }
        return;
      }

      // Initialize component first if not yet initialized.
      if (!this.components[attrName] && this.hasAttribute(attrName)) {
        this.updateComponent(attrName,
                             window.HTMLElement.prototype.getAttribute.call(this, attrName));
      }

      // Determine new attributes from the arguments
      if (typeof arg2 !== 'undefined' &&
          typeof arg1 === 'string' &&
          arg1.length > 0 &&
          typeof utils.styleParser.parse(arg1) === 'string') {
        // Update a single property of a multi-property component
        newAttrValue = {};
        newAttrValue[arg1] = arg2;
        clobber = false;
      } else {
        // Update with a value, object, or CSS-style property string, with the possiblity
        // of clobbering previous values.
        newAttrValue = arg1;
        clobber = (arg2 === true);
      }

      // Update component
      this.updateComponent(attrName, newAttrValue, clobber);

      // In debug mode, write component data up to the DOM.
      isDebugMode = this.sceneEl && this.sceneEl.getAttribute('debug');
      if (isDebugMode) { this.components[attrName].flushToDOM(); }
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
      var key;

      // Flush entity's components to DOM.
      for (key in components) {
        components[key].flushToDOM(key in defaultComponents);
      }

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
      if (component) { return component.data; }
      return window.HTMLElement.prototype.getAttribute.call(this, attr);
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
      return window.HTMLElement.prototype.getAttribute.call(this, attr);
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

function isComponent (componentName) {
  if (componentName.indexOf(MULTIPLE_COMPONENT_DELIMITER) !== -1) {
    componentName = componentName.split(MULTIPLE_COMPONENT_DELIMITER)[0];
  }
  if (!COMPONENTS[componentName]) { return false; }
  return true;
}

AEntity = registerElement('a-entity', {prototype: proto});
module.exports = AEntity;
