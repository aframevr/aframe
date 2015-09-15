/* global HTMLElement */

require('../vr-register-element');

var THREE = require('../../lib/three');
var VRNode = require('./vr-node');
var VRUtils = require('../vr-utils');

/**
 *
 * VROBject represents all elements that are part of the 3D scene.
 * They all have a position, rotation and a scale.
 *
 */
var VRObject = module.exports = document.registerElement(
  'vr-object',
  {
    prototype: Object.create(
      VRNode.prototype,
      {

        //  ----------------------------------  //
        //   Native custom elements callbacks   //
        //  ----------------------------------  //

        createdCallback: {
          value: function () {
            this.object3D = new THREE.Object3D();
            this.load();
          },
          writable: window.debug
        },

        attributeChangedCallback: {
          value: function () {
            this.object3D = this.object3D || new THREE.Object3D();
            // Position
            var position = this.getAttribute('position');

            // Rotation
            var rotation = this.getAttribute('rotation');
            var rotationX = THREE.Math.degToRad(rotation.x);
            var rotationY = THREE.Math.degToRad(rotation.y);
            var rotationZ = THREE.Math.degToRad(rotation.z);

            // Scale
            var scale = this.getAttribute('scale');

            // Setting three.js parameters
            this.object3D.position.set(position.x, position.y, position.z);
            this.object3D.rotation.order = 'YXZ';
            this.object3D.rotation.set(rotationX, rotationY, rotationZ);
            this.object3D.scale.set(scale.x, scale.y, scale.z);
          },
          writable: window.debug
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
            // Setup animations if there's any
            this.addAnimations();
            VRNode.prototype.load.call(this);
          },
          writable: window.debug
        },

        setAttribute: {
          value: function (attr, val) {
            if (typeof val === 'object' &&
              (attr === 'position' ||
               attr === 'rotation' ||
               attr === 'scale')) {
              val = [val.x, val.y, val.z].join(' ');
            }
            HTMLElement.prototype.setAttribute.call(this, attr, val);
          },
          writable: window.debug
        },

        remove: {
          value: function (el) {
            this.object3D.remove(el.object3D);
          },
          writable: window.debug
        },

        initAttributes: {
          value: function (el) {
            var position = this.getAttribute('position');
            var rotation = this.getAttribute('rotation');
            var scale = this.getAttribute('scale');
            if (!position) { this.setAttribute('position', '0 0 0'); }
            if (!rotation) { this.setAttribute('rotation', '0 0 0'); }
            if (!scale) { this.setAttribute('scale', '1 1 1'); }
            // We force an attribute update if all the attributes are defined.
            // It syncs the attributes with the object3D.
            if (scale && rotation && scale) {
              VRObject.prototype.attributeChangedCallback.call(this);
            }
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
          value: function (attribute) {
            var value = HTMLElement.prototype.getAttribute.call(this, attribute);
            return VRUtils.parseAttributeString(attribute, value);
          },
          writable: window.debug
        }
      })
  }
);
