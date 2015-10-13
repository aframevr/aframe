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
      var newValStr = VRUtils.stringifyAttributeValue(newVal);
      if (oldVal === newValStr) { return; }
      if (attr === 'mixin') {
        this.updateStateMixins(newVal, oldVal);
        this.updateComponents();
        return;
      }
      this.updateComponent(attr);
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
      var diff = oldMixinsIds.filter(function (i) { return newMixinsIds.indexOf(i) < 0; });
      diff.forEach(function (mixinId) {
        // State Mixins
        var stateMixinsEls = document.querySelectorAll('[id^=' + mixinId + '-]');
        var stateMixinIds = stateMixinsEls.map(function (el) { return el.id; });
        stateMixinIds.forEach(self.removeMixin.bind(self));
      });
      this.states.forEach(function (state) {
        newMixinsIds.forEach(function (id) {
          var mixinId = id + '-' + state;
          self.addMixin(mixinId);
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
      var mixinEls = this.mixinEls;
      var hasMixin = false;
      var i;
      for (i = 0; i < mixinEls.length; ++i) {
        hasMixin = mixinEls[i].hasAttribute(name);
        if (hasMixin) { break; }
      }
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
        component.updateAttributes();
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
  },

  addState: {
    value: function (state) {
      if (this.is(state)) { return; }
      this.states.push(state);
      this.mapStateMixins(state, this.addMixin.bind(this));
      this.emit('state-added', {state: state});
    },
    writable: window.debug
  },

  removeState: {
    value: function (state) {
      var stateIndex = this.is(state);
      if (stateIndex === false) { return; }
      this.states.splice(stateIndex, 1);
      this.mapStateMixins(state, this.removeMixin.bind(this));
      this.emit('state-removed', {state: state});
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
  }
};

module.exports = document.registerElement(
  'vr-object',
  { prototype: Object.create(VRNode.prototype, proto) }
);
