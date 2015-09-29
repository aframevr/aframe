require('../vr-register-element');

var THREE = require('../../lib/three');
var VRObject = require('./vr-object');

module.exports = document.registerElement(
  'vr-camera',
  {
    prototype: Object.create(
      VRObject.prototype,
      {
        createdCallback: {
          value: function () {
            this.object3D = new THREE.PerspectiveCamera();
            this.saveInitialValues();
            this.load();
          }
        },

        attributeChangedCallback: {
          value: function () {
            // Camera parameters
            var fov = this.getAttribute('fov', 45);
            var near = this.getAttribute('near', 1);
            var far = this.getAttribute('far', 10000);
            var aspect = this.getAttribute('aspect',
                                           window.innerWidth / window.innerHeight);

            // Setting three.js camera parameters
            this.object3D.fov = fov;
            this.object3D.near = near;
            this.object3D.far = far;
            this.object3D.aspect = aspect;
            this.object3D.updateProjectionMatrix();
          }
        },

        saveInitialValues: {
          value: function () {
            if (this.initValues) { return; }
            this.initValues = {
              x: this.getAttribute('x', 0),
              y: this.getAttribute('y', 0),
              z: this.getAttribute('z', 0),
              rotX: this.getAttribute('rotX', 0),
              rotY: this.getAttribute('rotY', 0),
              rotZ: this.getAttribute('rotZ', 0),
              fov: this.getAttribute('fov', 45),
              near: this.getAttribute('near', 1),
              far: this.getAttribute('far', 10000),
              aspect: this.getAttribute('aspect',
                                        window.innerWidth / window.innerHeight)
            };
          }
        },

        restoreInitialValues: {
          value: function () {
            if (!this.initValues) { return; }
            this.setAttribute('x', this.initValues.x);
            this.setAttribute('y', this.initValues.y);
            this.setAttribute('z', this.initValues.z);
            this.setAttribute('rotX', this.initValues.rotX);
            this.setAttribute('rotY', this.initValues.rotY);
            this.setAttribute('rotZ', this.initValues.rotZ);
            this.setAttribute('fov', this.initValues.fov);
            this.setAttribute('near', this.initValues.far);
            this.setAttribute('far', this.initValues.far);
            this.setAttribute('aspect', this.initValues.aspect);
          }
        },

        reset: {
          value: function () {
            this.restoreInitialValues();
          }
        }
      }
    )
  }
);
