/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-grid',
    {
      prototype: Object.create(
        VRObject.prototype, {
          update: {
            value: function() {
              var material = new THREE.LineBasicMaterial( { color: 0x303030 } );
              var size = parseFloat(this.getAttribute('size')) || 14;
              var geometry = this.generateGeometry();

              if (!this.object3D) {
                this.object3D = new THREE.LineSegments( geometry, material, THREE.LinePieces );
              } else {
                this.object3D.geometry = geometry;
              }
            }
          },
          generateGeometry: {
            value: function(size) {
              var geometry = new THREE.Geometry();
              var floor = -0.04;
              var step = 1;
              for ( var i = 0; i <= size / step * 2; i ++ ) {
                  geometry.vertices.push( new THREE.Vector3( - size, floor, i * step - size ) );
                  geometry.vertices.push( new THREE.Vector3(   size, floor, i * step - size ) );
                  geometry.vertices.push( new THREE.Vector3( i * step - size, floor, -size ) );
                  geometry.vertices.push( new THREE.Vector3( i * step - size, floor,  size ) );
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
