/* global VRNode, VRTags */

// Registering element
VRTags["VR-OBJECT"] = true;

var VRObject = document.registerElement(
  'vr-object',
  {
    prototype: Object.create(
      VRNode.prototype,
      {
        init: {
          value: function() {
            this.object3D = new THREE.Object3D();
            this.load();
          }
        },

        attachedCallback: {
          value: function() {
            // When creating an element from JS is not guaranteed to have
            // a parent after initialization. It's up to the arbitrary
            // JS to attach the element to the DOM. We cover this
            // case here.
            this.addToParent();
          }
        },

        detachedCallback: {
          value: function() {
            var parent = this.parentNode;
            if (parent) {
              parent.remove(this);
            } else {
              // In certain cases like removing an element from the DOM inspector
              // The parentNode is null when calling this function.
              this.sceneEl.remove(this);
            }
          }
        },

        add: {
          value: function(el) {
            this.object3D.add(el.object3D);
          }
        },

        addToParent: {
          value: function() {
            var parent = this.parentNode;
            var attachedToParent = this.attachedToParent;
            if (!parent || attachedToParent) { return; }
            // To prevent an object to attach itself multiple time to the parent
            this.attachedToParent = true;
            parent.add(this);
          }
        },

        load: {
          value: function() {
            // To prevent calling load more than once
            if (this.hasLoaded) { return; }
            // Handle to the associated DOM element
            this.object3D.el = this;
            // It attaches itself to the threejs parent object3D
            this.addToParent();
            // It sets default values on the attributes if they're not defined
            this.initAttributes();
            VRObject.prototype.onAttributeChanged.call(this);
            VRNode.prototype.load.call(this);
            this.addAnimations();
          }
        },

        setAttribute: {
          value: function(attr, val) {
            if (typeof val === 'object' &&
              (attr === 'position' ||
               attr === 'rotation' ||
               attr === 'scale')) {
                val = [val.x, val.y, val.z].join(' ');
            }
            HTMLElement.prototype.setAttribute.call(this, attr, val);
          },
        },

        remove: {
          value: function(el) {
            this.object3D.remove(el.object3D);
          }
        },

        initAttributes: {
          value: function(el) {
            var position = this.getAttribute('position');
            var rotation = this.getAttribute('rotation');
            var scale = this.getAttribute('scale');
            if (!position) { this.setAttribute('position', '0 0 0'); }
            if (!rotation) { this.setAttribute('rotation', '0 0 0'); }
            if (!scale) { this.setAttribute('scale', '1 1 1'); }
          }
        },

        addAnimations: {
          value: function() {
            var animations = this.hasAttribute('animation') ?
              this.getAttribute('animation').split(' ') : [];
            var attachObject = function (animationName) {
              var el = document.getElementById(animationName);
              if (el) { el.add(this); }
            }.bind(this);
            animations.forEach(attachObject);
          },
        },

        onAttributeChanged: {
          value: function() {
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
          }
        },

        getAttribute: {
          value: function(attr) {
            var value = HTMLElement.prototype.getAttribute.call(this, attr);
            if (attr === 'position' ||
                attr === 'rotation' ||
                attr === 'scale') {
              value = this.parseAttributeString(value);
            }
            return value;
          }
        },

        parseAttributeString: {
          value: function(str) {
            var values;
            if (!str) { return null; }
            values = str.split(' ');
            return {
              x: parseFloat(values[0]),
              y: parseFloat(values[1]),
              z: parseFloat(values[2])
            };
          }
        },

        attributeChangedCallback: {
          value: function(name, previousValue, value) {
            VRObject.prototype.onAttributeChanged.call(this);
            if (VRObject.prototype.onAttributeChanged !== this.onAttributeChanged) {
              this.onAttributeChanged();
            }
          }
        }
      }
    )
  }
);
