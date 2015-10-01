/* global MutationObserver */

require('../vr-register-element');

var THREE = require('../../lib/three');
var VRComponents = require('./components');
var VRNode = require('./vr-node');
var VRUtils = require('../vr-utils');

/**
 *
 * VRObject represents all elements that are part of the 3D scene.
 * They all have a position, rotation and a scale.
 *
 */
var proto = {

  //  ----------------------------------  //
  //   Native custom elements callbacks   //
  //  ----------------------------------  //

  createdCallback: {
    value: function () {
      this.object3D = new THREE.Mesh();
      this.components = {};
      this.load();
    },
    writable: window.debug
  },

  attributeChangedCallback: {
    value: function (attrName, oldVal, newVal) {
      if (attrName === 'mixin') {
        this.mixinChanged(newVal, oldVal);
        return;
      }
      this.updateComponent(attrName);
    },
    writable: window.debug
  },

  mixinChanged: {
    value: function (newMixin, oldMixin) {
      if (oldMixin) { this.removeMixinListener(oldMixin); }
      this.attachMixinListener(newMixin);
    }
  },

  removeMixinListener: {
    value: function () {
      var observer = this.mixinObserver;
      if (!observer) { return; }
      observer.disconnect();
      this.mixinObserver = null;
    }
  },

  attachMixinListener: {
    value: function (mixinId) {
      var self = this;
      var mixinEl = this.mixinEl = document.querySelector('#' + mixinId);
      if (!mixinEl) { return; }
      var observer = new MutationObserver(function (mutations) {
        var attr = mutations[0].attributeName;
        self.applyMixin(attr);
      });
      var config = { attributes: true };
      observer.observe(mixinEl, config);
      this.mixinObserver = observer;
      this.applyMixin();
    }
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

  attachedCallback: {
    value: function () {
      // When creating an element from JS is not guaranteed to have
      // a parent after initialization. It's up to the arbitrary
      // JS to attach the element to the DOM. We cover this
      // case here.
      if (!this.hasLoaded) { return; }
      this.addToParent();
    },
    writable: window.debug
  },

  detachedCallback: {
    value: function () {
      this.parentEl.remove(this);
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
      // It sets default values on the attributes if they're not defined
      this.initAttributes();
      // Components initializaion
      this.initComponents();
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
      var mixinEl = this.mixinEl;
      var self = this;
      Object.keys(VRComponents).forEach(initComponent);
      function initComponent (key) {
        if (self.hasAttribute(key) || (mixinEl && mixinEl.hasAttribute(key))) {
          if (!VRComponents[key].Component) { return; }
          self.components[key] = new VRComponents[key].Component(self);
        }
      }
      // Updates components to match attributes values
      this.updateComponents();
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
      var component = VRComponents[name];
      if (!component) {
        VRUtils.warn('Unkown component name: ' + name);
        return;
      }
      this.components[name].updateAttributes(this.getAttribute(name));
    },
    writable: window.debug
  },

  initAttributes: {
    value: function (el) {
      var position = this.hasAttribute('position');
      var rotation = this.hasAttribute('rotation');
      var scale = this.hasAttribute('scale');
      var mixin = this.hasAttribute('mixin');
      if (!position) { this.setAttribute('position', '0 0 0'); }
      if (!rotation) { this.setAttribute('rotation', '0 0 0'); }
      if (!scale) { this.setAttribute('scale', '1 1 1'); }
      // Listens to changes on the mixin if there's any
      if (mixin) { this.attachMixinListener(this.getAttribute('mixin')); }
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
