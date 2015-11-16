/* global HTMLElement */
var re = require('../vr-register-element');
var registerElement = re.registerElement;
var isNode = re.isNode;

var THREE = require('../../lib/three');
var VRComponents = require('./components').components;
var VRNode = require('./vr-node');
var VRUtils = require('../vr-utils');

/**
 * Entity element definition.
 * Entities represent all elements that are part of the scene, and always have
 * a position, rotation, and scale.
 * In the entity-component system, entities are just a container of components.
 *
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

  attachedCallback: {
    value: function () {
      this.addToParent();
      this.load();
    },
    writable: window.debug
  },

  /**
   * Update component(s) if necessary.
   *
   * Note in Firefox, the callback is called even if the attribute value does
   * not change. In this case, do not update.
   *
   * @param {string} attr - Attribute name changed.
   * @param oldVal - Previous value.
   * @param newVal - Updated value. Will be `null` in case of attr removal.
   */
  attributeChangedCallback: {
    value: function (attr, oldVal, newVal) {
      var newValStr = newVal;
      var component = VRComponents[attr];
      // Don't need to update until entity is fully part of the scene.
      if (!this.hasLoaded) { return; }
      if (component && typeof newVal !== 'string' && newVal !== null) {
        newValStr = component.stringifyAttributes(newVal);
      }
      if (oldVal === newValStr) { return; }
      if (attr === 'mixin') {
        this.updateStateMixins(newVal, oldVal);
        this.updateComponents();
        return;
      }
      this.updateComponent(attr, oldVal, newVal);
    },
    writable: window.debug
  },

  detachedCallback: {
    value: function () {
      if (!this.parentEl) { return; }
      this.parentEl.remove(this);
    },
    writable: window.debug
  },

  applyMixin: {
    value: function (attr) {
      if (!attr) {
        this.updateComponents();
        return;
      }
      this.updateComponent(attr);
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
        VRUtils.error("Trying to add an object3D that doesn't exist");
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
      // It sets default components on the attributes if they're not defined
      // position, rotation and scale are assumed to be available for any
      // component. We initialize them first
      this.initComponents(this.defaults);
      // Components initialization
      this.initComponents(VRComponents);
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

  initComponents: {
    value: function (components) {
      var self = this;
      var keys = Object.keys(components);
      keys.forEach(function (key) {
        self.initComponent(key);
      });
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
      var i;
      var inMixin = false;
      var mixinEls = this.mixinEls;
      // If the defaults contain the component
      var inDefaults = this.defaults[name];
      // If the element contains the component
      var inAttribute = this.hasAttribute(name);
      if (inDefaults !== undefined || inAttribute) { return true; }
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
      VRUtils.log('Component initialized: %s', name);
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
      var components = Object.keys(this.components);
      // Updates components
      components.forEach(this.updateComponent.bind(this));
    },
    writable: window.debug
  },

  /**
   * Initialize, update, or remove a single component based on whether the
   * component is already initialized and the updated values.
   *
   * When initializing, we set the component on `this.components`.
   *
   * @param {string} name - Component name.
   * @param oldVal
   * @param newVal
   */
  updateComponent: {
    value: function (name, oldVal, newVal) {
      var component = this.components[name];
      if (component) {
        // Attribute was removed. Remove component.
        if (!this.isComponentDefined(name)) {
          component.remove();
          delete this.components[name];
          return;
        }
        // Component already initialized. Update component.
        // TODO: update component attribute more granularly.
        return component.updateAttributes();
      }
      // Component not yet initialized. Initialize component.
      this.initComponent(name);
    },
    writable: window.debug
  },

  setAttribute: {
    value: function (attr, value) {
      var component = VRComponents[attr];
      if (component && typeof value === 'object') {
        value = component.stringifyAttributes(value);
      }
      HTMLElement.prototype.setAttribute.call(this, attr, value);
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
