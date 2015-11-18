/* global HTMLElement */
var re = require('../vr-register-element');
var registerElement = re.registerElement;
var isNode = re.isNode;

var debug = require('../utils/debug');
var THREE = require('../../lib/three');
var VRComponents = require('./components').components;
var VRNode = require('./vr-node');

var log = debug('core:vr-object');
var error = debug('core:vr-object:error');
var warn = debug('components:material:warn');

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
 */
var proto = {
  defaults: {
    value: {
      position: '',
      rotation: '',
      scale: '',
      visible: ''
    }
  },

  createdCallback: {
    value: function () {
      this.states = [];
      this.components = {};
      this.object3D = new THREE.Mesh();
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
      this.load();
    },
    writable: window.debug
  },

  /**
   * Tell parent to remove this element's object3D from its object3D.
   * Do not call on scene element because that will cause a call to
   * document.body.remove().
   */
  detachedCallback: {
    value: function () {
      if (!this.parentEl || this.isScene) { return; }
      this.parentEl.remove(this);
    },
    writable: window.debug
  },

  applyMixin: {
    value: function (attr) {
      var attrValue = this.getAttribute(attr);
      if (!attr) {
        this.updateComponents();
        return;
      }
      this.updateComponent(attr, attrValue);
    },
    writable: window.debug
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
    },
    writable: window.debug
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
    },
    writable: window.debug
  },

  add: {
    value: function (el) {
      if (!el.object3D) {
        error("Trying to add an object3D that doesn't exist");
      }
      this.object3D.add(el.object3D);
    },
    writable: window.debug
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
      // If the parent isn't a VR node but eventually it will be
      // when a templated element is created, we want to attach
      // this element to the parent then
      parent.addEventListener('nodeready', attach);
      function attach () {
        // To prevent an object to attach itself multiple times to the parent
        self.attachedToParent = true;
        parent.add(self);
      }
    },
    writable: window.debug
  },

  load: {
    value: function () {
      // To prevent calling load more than once
      if (this.hasLoaded) { return; }
      // Handle to the associated DOM element
      this.object3D.el = this;
      // It attaches itself to the threejs parent object3D
      this.addToParent();
      // Components initialization
      this.updateComponents();
      // Call the parent class
      VRNode.prototype.load.call(this);
    },
    writable: window.debug
  },

  remove: {
    value: function (el) {
      this.object3D.remove(el.object3D);
    },
    writable: window.debug
  },

  /**
   * For a given component name it checks if it's defined
   * in the elements itself, the mixins or the default
   * values
   * @type {string} name The component name
   */
  isComponentDefined: {
    value: function (name) {
      // If the defaults contain the component
      var inDefaults = this.defaults[name];
      // If the element contains the component
      var inAttribute = this.hasAttribute(name);
      if (inDefaults !== undefined || inAttribute) { return true; }
      return this.isComponentMixedIn(name);
    }
  },

  isComponentMixedIn: {
    value: function (name) {
      var i;
      var inMixin = false;
      var mixinEls = this.mixinEls;
     // If any of the mixins contains the component
      for (i = 0; i < mixinEls.length; ++i) {
        inMixin = mixinEls[i].hasAttribute(name);
        if (inMixin) { break; }
      }
      return inMixin;
    }
  },

  initComponent: {
    value: function (name, isDependency) {
      // If it's not a component name or
      // If the component is already initialized
      if (!VRComponents[name] || this.components[name]) { return; }
      // If the component is not defined for the element
      if (!this.isComponentDefined(name) && !isDependency) { return; }
      this.initComponentDependencies(name);
      this.components[name] = new VRComponents[name].Component(this);
      log('Component initialized: %s', name);
    }
  },

  initComponentDependencies: {
    value: function (name) {
      var self = this;
      var component = VRComponents[name];
      var dependencies;
      // If the component doesn't exist
      if (!component) { return; }
      dependencies = VRComponents[name].dependencies;
      if (!dependencies) { return; }
      dependencies.forEach(function (component) {
        self.initComponent(component, true);
      });
    }
  },

  updateComponents: {
    value: function () {
      var self = this;
      var components = Object.keys(VRComponents);
      // Updates components
      components.forEach(updateComponent);
      function updateComponent (name) {
        var elValue = self.getAttribute(name);
        self.updateComponent(name, elValue);
      }
    },
    writable: window.debug
  },

  /**
   * Initialize, update, or remove a single component.
   *
   * When initializing, we set the component on `this.components`.
   *
   * @param {string} name - Component name.
   * @param {object} newData - The new attributes assigned to the component
   */
  updateComponent: {
    value: function (name, newData) {
      var component = this.components[name];
      var isDefault = name in this.defaults;
      var isMixedIn = this.isComponentMixedIn(name);
      if (component) {
        // Attribute was removed. Remove component.
        // 1. If the component is not defined in the defaults,
        // mixins or element attribute
        // 2. If the new data is null, it's not a default
        // component and the component it's not defined via
        // mixins
        if (!this.isComponentDefined(name) ||
            newData === null && !isDefault && !isMixedIn) {
          component.remove();
          delete this.components[name];
          return;
        }
        if (typeof newData === 'string') {
          newData = component.parseAttributesString(newData);
        }
        // Component already initialized. Update component.
        // TODO: update component attribute more granularly.
        component.updateAttributes(newData);
        return;
      }
      // Component not yet initialized. Initialize component.
      this.initComponent(name);
    },
    writable: window.debug
  },

  removeAttribute: {
    value: function (attr) {
      var component = VRComponents[attr];
      if (component) { this.setEntityAttribute(attr, undefined, null); }
      HTMLElement.prototype.removeAttribute.call(this, attr);
    },
    writable: window.debug
  },

  /**
   * For a given component name it sets the value of one of its
   * attributes
   *
   * @param {string} componentName - The name of the component
   * @param {string} attrName - The name of the attribute
   * @param {string} attrValue - The new value of the attribute
   *
   */
  setComponentAttribute: {
    value: function (componentName, attrName, attrValue) {
      var attrs = this.getAttribute(componentName);
      var component = this.components[componentName];
      if (!component) {
        warn('Trying to update an attribute of component "%s" ' +
              'that is not defined on the entity', componentName);
      }
      attrs[attrName] = attrValue;
      this.updateComponent(componentName, attrs);
      return attrs;
    },
    writable: window.debug
  },

  /**
   * It deals with updates on entity specific attributes: components and mixins
   *
   * @param {string} attr - Attribute name
   * @param {string} oldVal - Previous value of the attribute
   * @param {string|object} newVal - New value of the attribute
   *
   */
  setEntityAttribute: {
    value: function (attr, oldVal, newVal) {
      var component = VRComponents[attr];
      oldVal = oldVal || this.getAttribute(attr);
      // When creating objects programatically and setting attributes
      // the object is not part of the scene until is inserted in the
      // DOM
      if (!this.hasLoaded) { return; }
      if (attr === 'mixin') {
        this.updateStateMixins(newVal, oldVal);
        this.updateComponents();
        return;
      }
      if (component) { this.updateComponent(attr, newVal); }
    }
  },

  /**
   * If the attribute name corresponds to the name of a component.
   * setAttribute will update, initialize or remove the component
   * from the entity.
   *
   * Examples:
   *
   * setAttribute('id', 'my-element');
   * setAttribute('material', { color: 'crimson' });
   * setAttribute('material', 'color', 'crimson');
   *
   * @param {string} attr - attribute name. setAttribute will update or initialize
   *        a component if the attribute name corresponds to a registered component.
   * @param {string|object} value - The value of the attribute or component.
   *        It accepts objects in the case of a component
   * @param {string} componentAttrValue - If defined, value will act as the attribute
   *        name and setAttribute will only set a single component attribute.
   */
  setAttribute: {
    value: function (attr, newValue, componentAttrValue) {
      var self = this;
      var component = VRComponents[attr];
      var newValueStr = newValue;
      // Make sure we send a string to native setAttribute
      // It updates one attribute of the component
      if (arguments.length === 3) {
        // Update only one attribute of the given component
        newValue = this.setComponentAttribute(attr, newValue, componentAttrValue);
        callSuper();
      } else { // It updates the whole attribute set
        // We need to call first on VRNode to make sure mixins are updated
        // before updating components
        callSuper();
        this.setEntityAttribute(attr, undefined, newValue);
      }

      function callSuper () {
        if (component) { newValueStr = component.stringifyAttributes(newValue); }
        VRNode.prototype.setAttribute.call(self, attr, newValueStr);
      }
    },
    writable: window.debug
  },

  /**
   * If attribute is a component, it parses the style-like string into an
   * object. Returned component data does not include applied mixins or
   * defaults.
   *
   * @param {string} attr
   * @returns {object|string} Object if component, else string.
   */
  getAttribute: {
    value: function (attr) {
      var component = VRComponents[attr];
      var value = HTMLElement.prototype.getAttribute.call(this, attr);
      if (!component || typeof value !== 'string') { return value; }
      return component.parseAttributesString(value);
    },
    writable: window.debug
  },

  /**
   * If attribute is a component, it returns component data including applied
   * mixins and defaults.
   *
   * @param {string} attr
   * @returns {object|string} Object if component, else string.
   */
  getComputedAttribute: {
    value: function (attr) {
      var component = this.components[attr];
      if (component) { return component.getData(); }
      return HTMLElement.prototype.getAttribute.call(this, attr);
    },
    writable: window.debug
  },

  addState: {
    value: function (state) {
      if (this.is(state)) { return; }
      this.states.push(state);
      this.mapStateMixins(state, this.registerMixin.bind(this));
      this.emit('stateadded', {state: state});
    },
    writable: window.debug
  },

  removeState: {
    value: function (state) {
      var stateIndex = this.is(state);
      if (stateIndex === false) { return; }
      this.states.splice(stateIndex, 1);
      this.mapStateMixins(state, this.unregisterMixin.bind(this));
      this.emit('stateremoved', {state: state});
    },
    writable: window.debug
  },

  /**
   * Checks if the element is in a given state. e.g. el.is('alive');
   * @type {string} state - Name of the state we want to check
   */
  is: {
    value: function (state) {
      var is = false;
      this.states.forEach(function (elState, index) {
        if (elState === state) { is = index; }
      });
      return is;
    },
    writable: window.debug
  }
};

module.exports = registerElement('vr-object', {
  prototype: Object.create(VRNode.prototype, proto)
});
