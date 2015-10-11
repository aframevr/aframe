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
    value: function (attrName, oldVal, newVal) {
      if (attrName === 'mixin') {
        this.updateComponents();
        return;
      }
      this.updateComponent(attrName);
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
    }
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
      if (!parent || attachedToParent || !VRNode.prototype.isPrototypeOf(parent)) { return; }
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
      // Components initialization
      this.initComponents();
      // It sets default values on the attributes if they're not defined
      this.initDefaults();
      // Call the parent class
      VRNode.prototype.load.call(this);
    },
    writable: window.debug
  },

  setAttribute: {
    value: function (attr, val) {
      return VRNode.prototype.setAttribute.call(this, attr, val);
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
    value: function () {
      var components = Object.keys(VRComponents);
      components.forEach(this.initComponent.bind(this));
    }
  },

  initComponent: {
    value: function (name) {
      var mixinEl = this.mixinEl;
      var hasMixin = mixinEl && mixinEl.hasAttribute(name);
      var hasAttribute = this.hasAttribute(name);
      if (!hasAttribute && !hasMixin) { return; }
      if (!VRComponents[name]) { return; }
      this.components[name] = new VRComponents[name].Component(this);
      VRUtils.log('Component initialized: ' + name);
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
        component.updateAttributes(this.getAttribute(name));
        VRUtils.log('Component updated: ' + name);
        return;
      }
      this.initComponent(name);
    },
    writable: window.debug
  },

  initDefaults: {
    value: function (el) {
      var self = this;
      var defaults = this.defaults;
      var keys = Object.keys(defaults);
      keys.forEach(initDefault);
      function initDefault (key) {
        if (self.hasAttribute(key)) { return; }
        self.setAttribute(key, defaults[key]);
      }
    },
    writable: window.debug
  },

  getAttribute: {
    value: function (attrName, defaultValue) {
      return VRNode.prototype.getAttribute.call(this, attrName, defaultValue);
    },
    writable: window.debug
  }
};

module.exports = document.registerElement(
  'vr-object',
  { prototype: Object.create(VRNode.prototype, proto) }
);
