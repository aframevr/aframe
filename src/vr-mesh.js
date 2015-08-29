/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-mesh',
    {
      prototype: Object.create(
        VRObject.prototype, {
          init: {
            value: function() {
              var geometry = this.getGeometry();
              var material = this.getMaterial();
              this.object3D = new THREE.Mesh(geometry, material);
              this.load();
            }
          },

          update: {
            value: function() {
              var material = this.getMaterial();
              if (material) {
                this.object3D.material = material;
              }
              this.object3D.geometry = this.getGeometry();
            }
          },

          getGeometry: {
            value: function() {
              var geometryId = this.getAttribute('geometry');
              var geometryEl = geometryId? document.querySelector('#' + geometryId) : undefined;
              return (geometryEl && geometryEl.geometry) || new THREE.BoxGeometry( 200, 200, 200 );
            }
          },

          getMaterial: {
            value: function() {
              var color = this.getAttribute('color');
              var materialId = this.getAttribute('material');
              var materialEl;
              var material;

              if(color && materialId) {
                materialEl = materialId? document.querySelector('#' + materialId) : undefined;
                material = materialEl.material;
                material.color = new THREE.Color(color);
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
  VRTags["VR-MESH"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRMesh',this));
