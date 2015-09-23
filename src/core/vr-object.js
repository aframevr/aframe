require('../vr-register-element');

var THREE = require('../../lib/three');
var VRComponents = require('../components/components');
var VRNode = require('./vr-node');
var VRUtils = require('../vr-utils');

var mixinPrototype = function (destination, source) {
  for (var key in source) {
    destination[key] = { value: source[key], writable: window.debug };
  }
};

var mixinComponents = function (proto, components) {
  for (var key in components) {
    mixinPrototype(proto, components[key]);
  }
};

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
      this.load();
    },
    writable: window.debug
  },

  attributeChangedCallback: {
    value: function (attrName, oldVal, newVal) {
      this.updateComponent(attrName, oldVal);
    },
    writable: window.debug
  },

  updateComponent: {
    value: function (name, oldVal) {
      // Capitalizes first letter of attribute name.
      var component = name.charAt(0).toUpperCase() + name.slice(1);
      var funcName = 'update' + component;
      var updateComponent = this[funcName];
      var value = this.getAttribute(name);

      if (typeof updateComponent !== 'function') {
        VRUtils.warn('Unknown Attribute ' + name);
        return;
      }
      updateComponent.call(this, value, oldVal);
    },
    writable: window.debug
  },

  updatePosition: {
    value: function () {
      var position = this.getAttribute('position', {x: 0, y: 0, z: 0});
      // Updates three.js object
      this.object3D.position.set(position.x, position.y, position.z);
    }
  },

  updateRotation: {
    value: function () {
      var rotation = this.getAttribute('rotation', {x: 0, y: 0, z: 0});
      var rotationX = THREE.Math.degToRad(rotation.x);
      var rotationY = THREE.Math.degToRad(rotation.y);
      var rotationZ = THREE.Math.degToRad(rotation.z);
      // Updates three.js object
      this.object3D.rotation.set(rotationX, rotationY, rotationZ);
    }
  },

  updateScale: {
    value: function () {
      // Scale
      var scale = this.getAttribute('scale', {x: 1, y: 1, z: 1});
      // Updates three.js object
      this.object3D.scale.set(scale.x, scale.y, scale.z);
    }
  },

  updateTemplate: {
    value: function (value, oldVal) {
      var templateId = this.getAttribute('template');
      if (oldVal) {
        this.removeFromTemplate(oldVal);
      }
      if (!templateId) { return; }
      var template = document.querySelector('#' + templateId);
      if (!template) { return; }
      this.template = template;
      this.template.add(this);
    }
  },

  removeFromTemplate: {
    value: function (id) {
      var template = document.querySelector('#' + id);
      this.template = null;
      if (!template) { return; }
      template.remove(this);
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
      if (!parent || attachedToParent) { return; }
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
      // Updates the template if there's any
      this.updateTemplate();
      // Updates components to match attributes values
      this.updateComponents();
      // Setup animations if there's any
      this.addAnimations();
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

  updateComponents: {
    value: function () {
      var controls;
      var camera;
      this.updatePosition();
      this.updateRotation();
      this.updateScale();
      this.updateMaterial(this.getAttribute('material'));
      this.updateGeometry(this.getAttribute('geometry'));
      camera = this.getAttribute('camera');
      if (!camera) { return; }
      this.updateCamera(camera);
      controls = this.getAttribute('controls');
      if (!controls) { return; }
      this.updateControls(controls);
    },
    writable: window.debug
  },

  initAttributes: {
    value: function (el) {
      var position = this.hasAttribute('position');
      var rotation = this.hasAttribute('rotation');
      var scale = this.hasAttribute('scale');
      if (!position) { this.setAttribute('position', '0 0 0'); }
      if (!rotation) { this.setAttribute('rotation', '0 0 0'); }
      if (!scale) { this.setAttribute('scale', '1 1 1'); }
    },
    writable: window.debug
  },

  addAnimations: {
    value: function () {
      var self = this;
      var animations = this.getAttribute('animation');
      if (!animations) { return; }
      animations = animations.split(' ');
      animations.forEach(attachObject);
      function attachObject (animationName) {
        var el = document.getElementById(animationName);
        if (!el) { return; }
        el.add(self);
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

mixinComponents(proto, VRComponents);

module.exports = document.registerElement(
  'vr-object',
  { prototype: Object.create(VRNode.prototype, proto) }
);
