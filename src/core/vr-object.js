/* global HTMLElement */
require('../vr-register-element');

var THREE = require('../../lib/three');
var VRComponents = require('./components').components;
var VRNode = require('./vr-node');
var VRUtils = require('../vr-utils');

/**
 *
 * VRObject represents all elements that are part of the 3D scene.
 * They all have a position, rotation and a scale.
 *
 */
var proto = {

  // Default Attribute Values
  defaults: {
    value: {
      position: '0 0 0',
      rotation: '0 0 0',
      scale: '1 1 1'
    }
  },

  //  ----------------------------------  //
  //   Native custom elements callbacks   //
  //  ----------------------------------  //
  attachedCallback: {
    value: function () {
      this.object3D = new THREE.Mesh();
      this.components = {};
      this.states = [];
      this.light = null;
      this.addToParent();
      this.load();
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

  attributeChangedCallback: {
    value: function (attr, oldVal, newVal) {
      // In Firefox the callback is called even if the
      // attribute value doesn't change. We return
      // if old and new values are the same
      var newValStr = newVal;
      var component = VRComponents[attr];
      var light = this.light;
      // When creating objects programatically and setting attributes
      // the object is not part of the scene until is inserted in the
      // DOM
      if (!this.hasLoaded) { return; }
      if (component && typeof newVal !== 'string') {
        newValStr = component.stringifyAttributes(newVal);
      }
      if (oldVal === newValStr) { return; }
      if (attr === 'mixin') {
        this.updateStateMixins(newVal, oldVal);
        this.updateComponents();
        return;
      }
      this.updateComponent(attr);
      if (light && ['position', 'rotation'].indexOf(attr) !== -1) {
        this.registerLight(light);
      }
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
      var parent = this.parentEl = this.parentNode;
      var attachedToParent = this.attachedToParent;
      if (!parent || attachedToParent || !parent.isVRNode) { return; }
      // To prevent an object to attach itself multiple times to the parent
      this.attachedToParent = true;
      parent.add(this);
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
    value: function (name, attrs) {
      var defaults = this.defaults;
      var hasAttribute = this.hasAttribute(name);
      // If it's not a component name or
      // If the component is already initialized
      if (!VRComponents[name] || this.components[name]) { return; }
      // If the component is not defined for the element
      if (!this.isComponentDefined(name) && attrs === undefined) { return; }
      this.initComponentDependencies(name);
      this.components[name] = new VRComponents[name].Component(this);
      // If the attribute is not defined but has a default we set it
      if (!hasAttribute) {
        attrs = defaults[name] ? defaults[name] : attrs;
        if (attrs !== undefined) { this.setAttribute(name, attrs); }
      }
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
      Object.keys(dependencies).forEach(function (key) {
        self.initComponent(key, dependencies[key]);
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

  updateComponent: {
    value: function (name) {
      var component = this.components[name];
      // Update if component already initialized
      if (component) {
        // TODO: update component attribute more granularly.
        component.updateAttributes();
        return;
      }
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

  getAttribute: {
    value: function (attr, defaultValue) {
      var component = VRComponents[attr];
      var value = HTMLElement.prototype.getAttribute.call(this, attr, defaultValue);
      if (!component || typeof value !== 'string') { return value; }
      return component.parseAttributesString(value);
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

  is: {
    value: function (state) {
      var is = false;
      this.states.forEach(function (elState, index) {
        if (elState === state) { is = index; }
      });
      return is;
    },
    writable: window.debug
  },

  /**
   * Registers light component data to the vr-scene.
   * Attaches entity's position/rotation to the light component data.
   * Use entity's rotation as light's direction.
   *
   * @param {object} light - light attributes (e.g., color, intensity).
   */
  registerLight: {
    value: function (light) {
      if (!this.light) {
        // Store the light in case the entity's position or rotation changes.
        this.light = light;
      }
      light.direction = this.getAttribute('rotation');
      light.position = this.getAttribute('position');
      this.sceneEl.registerLight(light);
    }
  }
};

module.exports = document.registerElement(
  'vr-object',
  { prototype: Object.create(VRNode.prototype, proto) }
);
