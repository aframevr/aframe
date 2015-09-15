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
            var camera = this.object3D = new THREE.PerspectiveCamera();
            // This should probably managed within vr-scene
            this.sceneEl.camera = camera;
            this.saveInitialValues();
            this.load();
          }
        },

        attributeChangedCallback: {
          value: function () {
            // Camera parameters
            var fov = parseFloat(this.getAttribute('fov')) || 45;
            var near = parseFloat(this.getAttribute('near')) || 1;
            var far = parseFloat(this.getAttribute('far')) || 10000;
            var aspect = parseFloat(this.getAttribute('aspect')) ||
                         window.innerWidth / window.innerHeight;

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
              x: parseFloat(this.getAttribute('x')) || 0,
              y: parseFloat(this.getAttribute('y')) || 0,
              z: parseFloat(this.getAttribute('z')) || 0,
              rotX: parseFloat(this.getAttribute('rotX')) || 0,
              rotY: parseFloat(this.getAttribute('rotY')) || 0,
              rotZ: parseFloat(this.getAttribute('rotZ')) || 0,
              fov: parseFloat(this.getAttribute('fov')) || 45,
              near: parseFloat(this.getAttribute('nar')) || 1,
              far: parseFloat(this.getAttribute('far')) || 10000,
              aspect: parseFloat(this.getAttribute('aspect')) ||
                      window.innerWidth / window.innerHeight
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
