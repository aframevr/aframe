/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-camera',
    {
      prototype: Object.create(
        VRObject.prototype, {
          init: {
            value: function() {
              var camera = this.object3D = new THREE.PerspectiveCamera();
              // This should probably managed within vr-scene
              this.sceneEl.camera = camera;
              this.saveInitialValues();
              this.load();
            }
          },

          saveInitialValues: {
            value: function() {
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
                aspect: parseFloat(this.getAttribute('aspect'))
                  || window.innerWidth / window.innerHeight
              };
            }
          },

          restoreInitialValues: {
            value: function() {
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

          onAttributeChanged: {
            value: function() {
              // Camera parameters
              var fov = parseFloat(this.getAttribute('fov')) || 45;
              var near = parseFloat(this.getAttribute('nar')) || 1;
              var far = parseFloat(this.getAttribute('far')) || 10000;
              var aspect = parseFloat(this.getAttribute('aspect'))
                || window.innerWidth / window.innerHeight;

              // Setting three.js camera parameters
              this.object3D.fov = fov;
              this.object3D.near = near;
              this.object3D.far = far;
              this.object3D.aspect = aspect;
              this.object3D.updateProjectionMatrix();
            }
          },

          reset: {
            value: function() {
              this.restoreInitialValues();
            }
          }
      }
      )
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-CAMERA"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRCamera',this));