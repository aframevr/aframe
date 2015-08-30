/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-grid',
    {
      prototype: Object.create(
        VRObject.prototype, {
          init: {
            value: function() {
              var material = new THREE.LineBasicMaterial( { color: 0x606060 } );
              var geometry = this.generateGeometry();
              this.object3D = new THREE.LineSegments( geometry, material, THREE.LinePieces );
              this.load();
            }
          },

          onAttributeChanged: {
            value: function() {
              this.object3D.geometry = this.generateGeometry();
            }
          },

          generateGeometry: {
            value: function(size) {
              var size = parseFloat(this.getAttribute('size')) || 14;
              var density = parseFloat(this.getAttribute('density')) || 1;

              // Grid
              var density = 1;

              var geometry = new THREE.Geometry();
              var material = new THREE.LineBasicMaterial( { color: 0x303030 } );

              for ( var i = - size; i <= size; i += density ) {

                geometry.vertices.push( new THREE.Vector3( - size, - 0.04, i ) );
                geometry.vertices.push( new THREE.Vector3(   size, - 0.04, i ) );

                geometry.vertices.push( new THREE.Vector3( i, - 0.04, - size ) );
                geometry.vertices.push( new THREE.Vector3( i, - 0.04,   size ) );

              }

              return geometry;
            }
          }
        }
      )
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-GRID"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRGrid',this));
