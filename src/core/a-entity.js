/* global HTMLElement */
var ANode = require('./a-node');
var components = require('./component').components;
var debug = require('../utils/debug');
var re = require('./a-register-element');
var THREE = require('../lib/three');

var isNode = re.isNode;
var log = debug('core:a-entity');
var error = debug('core:a-entity:error');
var registerElement = re.registerElement;

var AEntity;

/**
 * Entity element definition.
 * Entities represent all elements that are part of the scene, and always have
 * a position, rotation, and scale.
 * In the entity-component system, entities are just a container of components.
 *
 * For convenience of inheriting components, the scene element inherits from
 * this prototype. When necessary, it differentiates itself by setting
 * `this.isScene`.
 *
 * @namespace Entity
 * @member {object} components - entity's currently initialized components.
 * @member {object} object3D - three.js object.
 * @member {array} states
 * @member {boolean} paused - true if dynamic behavior of the entity is paused
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
      this.isEntity = true;
      this.states = [];
      this.components = {};
      this.paused = true;
      this.object3D = new THREE.Group();
      this.object3D.el = this;
      this.object3DMap = {};
    }
  },

  attributeChangedCallback: {
    value: function (attr, oldVal, newVal) {
      this.setEntityAttribute(attr, oldVal, newVal);
    }
  },

  attachedCallback: {
    value: function () {
      this.addToParent();
      if (!this.isScene) {
        this.load();
        if (!this.parentNode.paused) { this.play(); }
      }
    }
  },

  /**
   * Tell parent to remove this element's object3D from its object3D.
   * Do not call on scene element because that will cause a call to
   * document.body.remove().
   */
  detachedCallback: {
    value: function () {
      if (!this.parentEl || this.isScene) { return; }
      this.removeComponents();
      this.parentEl.remove(this);
    }
  },

  applyMixin: {
    value: function (attr) {
      var attrValue = this.getAttribute(attr);
      if (!attr) {
        this.updateComponents();
        return;
      }
      this.updateComponent(attr, attrValue);
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
        var stateMixinIds = [];
        forEach.call(stateMixinsEls, function (el) { stateMixinIds.push(el.id); });
        stateMixinIds.forEach(self.unregisterMixin.bind(self));
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
      var oldObj = this.object3DMap[type];
      if (oldObj) { this.object3D.remove(oldObj); }
      if (obj instanceof THREE.Object3D) {
        obj.el = this;
        this.object3D.add(obj);
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
   * Returns an object3D of a given type or creates it if it doesn't exist and
   * a Constructor is passed as an argument
   * @param {string} type - Type of the object3D .
   * @param {string} name - Component name.
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

  add: {
    value: function (el) {
      if (!el.object3D) {
        error("Trying to add an object3D that doesn't exist");
      }
      this.emit('child-attached', { el: el });
      this.object3D.add(el.object3D);
    }
  },

  addToParent: {
    value: function () {
      var self = this;
      var parent = this.parentEl = this.parentNode;
      var attachedToParent = this.attachedToParent;
      if (!parent || attachedToParent) { return; }
      if (isNode(parent)) {
        attach();
        return;
      }
      parent.addEventListener('nodeready', attach);
      function attach () {
        // To prevent an object to attach itself multiple times to the parent.
        self.attachedToParent = true;
        if (parent.add) {
          parent.add(self);
        }
      }
    }
  },

  load: {
    value: function () {
      if (this.hasLoaded) { return; }

      // Attach to parent object3D.
      this.addToParent();

      if (this.isScene) {
        ANode.prototype.load.call(this, this.updateComponents.bind(this));
      } else {
        ANode.prototype.load.call(this, this.updateComponents.bind(this),
                                  function (el) { return el.isEntity; });
      }
    },
    writable: window.debug
  },

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
   */
  initComponent: {
    value: function (name, isDependency) {
      var isComponentDefined;

      // Check if already initialized.
      if (!components[name] || this.components[name]) { return; }

      // Check if not defined for entity.
      isComponentDefined = checkComponentDefined(this, name);
      if (!isComponentDefined && !isDependency) { return; }

      // Initialize dependencies.
      this.initComponentDependencies(name);

      if (isDependency && !isComponentDefined) {
        // Add component if it is a dependency and not yet defined.
        this.setAttribute(name, '');
      } else {
        if (this.isScene && !this.hasAttribute(name) && name in this.defaultComponents) {
          // For scene default components, expose them in the DOM.
          HTMLElement.prototype.setAttribute.call(this, name, this.defaultComponents[name]);
        }
        this.components[name] = new components[name].Component(this);
        if (!this.paused) { this.components[name].play(); }
      }

      log('Component initialized: %s', name);
    }
  },

  initComponentDependencies: {
    value: function (name) {
      var self = this;
      var component = components[name];
      var dependencies;
      if (!component) { return; }
      dependencies = components[name].dependencies;
      if (!dependencies) { return; }
      dependencies.forEach(function (component) {
        self.initComponent(component, true);
      });
    }
  },

  removeComponent: {
    value: function (name) {
      var component = this.components[name];
      var scene;
      if (component.tick) {
        scene = this.isScene ? this.el : this.sceneEl;
        scene.removeBehavior(component);
      }
      component.remove();
      delete this.components[name];
    }
  },

  removeComponents: {
    value: function () {
      Object.keys(this.components).forEach(this.removeComponent.bind(this));
    }
  },

  updateComponents: {
    value: function () {
      var self = this;
      var allComponents = Object.keys(components);
      allComponents.forEach(updateComponent);
      function updateComponent (name) {
        var elValue = self.getAttribute(name);
        self.updateComponent(name, elValue);
      }
    }
  },

  /**
   * Initialize, update, or remove a single component.
   *
   * When initializing, we set the component on `this.components`.
   *
   * @param {string} name - Component name.
   * @param {object} newData - The new properties assigned to the component
   */
  updateComponent: {
    value: function (name, newData) {
      var component = this.components[name];
      var isDefault = name in this.defaultComponents;
      var isMixedIn = isComponentMixedIn(name, this.mixinEls);
      if (component) {
        // Attribute was removed. Remove component.
        // 1. If the component is not defined in the defaults,
        // mixins or element attribute
        // 2. If the new data is null, it's not a default
        // component and the component it's not defined via
        // mixins
        if (!checkComponentDefined(this, name) ||
            newData === null && !isDefault && !isMixedIn) {
          this.removeComponent(name);
          return;
        }
        // Component already initialized. Update component.
        component.updateProperties(newData);
        return;
      }
      // Component not yet initialized. Initialize component.
      this.initComponent(name);
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
      var component = components[attr];
      if (component) {
        this.setEntityAttribute(attr, undefined, null);
      }
      HTMLElement.prototype.removeAttribute.call(this, attr);
    }
  },

  /**
   * Starts any dynamic behavior associated to the entity
   * this involves dynamic components and animations
   */
  play: {
    value: function () {
      var components = this.components;
      var componentKeys = Object.keys(components);
      if (!this.paused) { return; }
      this.paused = false;
      componentKeys.forEach(function playComponent (key) {
        components[key].play();
      });
      this.getChildEntities().forEach(function play (obj) {
        obj.play();
      });
      this.emit('play');
    },
    writable: true
  },

  /**
   * Stops any dynamic behavior associated to the entity
   * This involves dynamic components and animations
   */
  pause: {
    value: function () {
      var components = this.components;
      var componentKeys = Object.keys(components);
      if (this.paused) { return; }
      this.paused = true;
      componentKeys.forEach(function pauseComponent (key) {
        components[key].pause();
      });
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
      var component = components[attr];
      oldVal = oldVal || this.getAttribute(attr);
      // When creating entities programatically and setting attributes, it is not part
      // of the scene until it is inserted into the DOM. This does not apply to scenes as
      // scenes depend on its child entities to load.
      if (!this.hasLoaded && !this.isScene) { return; }
      if (attr === 'mixin') {
        this.updateStateMixins(newVal, oldVal);
        this.updateComponents();
        return;
      }
      if (component) { this.updateComponent(attr, newVal); }
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
      var self = this;
      var component = this.components[attr] || components[attr];
      var partialComponentData;
      value = value === undefined ? '' : value;
      var valueStr = value;
      var oldValue;

      if (component) {
        if (typeof value === 'string' && componentPropValue !== undefined) {
          // Update currently-defined component data with the new property value.
          partialComponentData = self.getAttribute(attr) || {};
          partialComponentData[value] = componentPropValue;
          value = partialComponentData;
        }
        valueStr = component.stringify(value);
      }

      oldValue = this.getAttribute(attr);
      ANode.prototype.setAttribute.call(self, attr, valueStr);
      self.setEntityAttribute(attr, oldValue, value);
    },
    writable: window.debug
  },

  /**
   * If `attr` is a component, returns JUST the component data specified in the HTML
   * by parsing the style-like string into an object. Like a partial version of
   * `getComputedAttribute` as returned component data does not include applied mixins or
   * defaults.
   *
   * If `attr` is not a component, fall back to HTML getAttribute.
   *
   * @param {string} attr
   * @returns {object|string} Object if component, else string.
   */
  getAttribute: {
    value: function (attr) {
      var component = this.components[attr] || components[attr];
      var value = HTMLElement.prototype.getAttribute.call(this, attr);
      if (!component || typeof value !== 'string') { return value; }
      return component.parse(value);
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
      var component = this.components[attr];
      if (component) { return component.getData(); }
      return HTMLElement.prototype.getAttribute.call(this, attr);
    }
  },

  addState: {
    value: function (state) {
      if (this.is(state)) { return; }
      this.states.push(state);
      this.mapStateMixins(state, this.registerMixin.bind(this));
      this.emit('stateadded', {state: state});
    }
  },

  removeState: {
    value: function (state) {
      var stateIndex = this.is(state);
      if (stateIndex === false) { return; }
      this.states.splice(stateIndex, 1);
      this.mapStateMixins(state, this.unregisterMixin.bind(this));
      this.emit('stateremoved', {state: state});
    }
  },

  /**
   * Checks if the element is in a given state. e.g. el.is('alive');
   * @type {string} state - Name of the state we want to check
   */
  is: {
    value: function (state) {
      var is = false;
      this.states.forEach(function (elState, index) {
        if (elState === state) { is = true; }
      });
      return is;
    }
  }
});

/**
 * Check if a component is defined for an entity, including defaults and mixins.
 *
 * @param {string} name - Component name.
 * @returns {boolean}
 */
function checkComponentDefined (el, name) {
  // Check if default components contain the component.
  var inDefaults = el.defaultComponents[name];
  // Check if element contains the component.
  var inAttribute = el.hasAttribute(name);
  if (inDefaults !== undefined || inAttribute) { return true; }
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

AEntity = registerElement('a-entity', {
  prototype: proto
});
module.exports = AEntity;
