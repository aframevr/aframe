/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-sphere',
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

          onAttributeChanged: {
            value: function() {
              var material = this.getMaterial();
              var geometry = this.getGeometry();
              this.object3D.geometry = geometry;
              this.object3D.material = material;
            }
          },

          getGeometry: {
            value: function() {
              var radius = parseFloat(this.getAttribute('radius')) || 5;
              return new THREE.SphereGeometry( radius, 20, 20 );
            }
          },

          getMaterial: {
            value: function() {
              var color = this.getAttribute('color');
              var materialId = this.getAttribute('material');
              var materialEl;
              var material;

              if(materialId) {
                materialEl = materialId? document.querySelector('#' + materialId) : undefined;
                material = materialEl.material;
                if(color){
                  material.color = new THREE.Color(color);
                }
              } else if (color) {
                material = new THREE.MeshPhongMaterial({color:color})
              } else {
                material = new THREE.MeshNormalMaterial()
              }

              return material;
            }
          }
        })
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-SPHERE"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRSphere',this));