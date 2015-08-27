/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-skysphere',
    {
      prototype: Object.create(
        VRObject.prototype, {
          init: {
            value: function() {
              var material = this.getMaterial();
              var geometry = this.getGeometry();
              this.object3D = new THREE.Mesh( geometry, material );
              this.load();
            }
          },

          update: {
            value: function() {
              var material = this.getMaterial();
              var geometry = this.getGeometry();
              this.object3D.geometry = geometry;
              this.object3D.material = material;
            }            
          },

          getGeometry: {
            value: function() {
              var radius = parseFloat(this.getAttribute('radius')) || 5000;
              return new THREE.SphereGeometry( radius, 64, 40 );
            }
          },

          getMaterial: {
            value: function() {
              var imgSrc = this.getAttribute('src');
              return new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture(imgSrc), side: THREE.BackSide });
            }
          }
        })
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-SKYSPHERE"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRSkysphere',this));
