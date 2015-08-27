/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-curvedPlane2',
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

              var radius = parseFloat(this.getAttribute('radius')) || 10;
              var height = parseFloat(this.getAttribute('height')) || 5;
              var thetaStart = parseFloat(this.getAttribute('thetaStart')) || Math.PI;
              var thetaLength = parseFloat(this.getAttribute('thetaLength')) || 90;
              var color = parseFloat(this.getAttribute('color')) || 0xCC0000;;
              var opacity = parseFloat(this.getAttribute('opacity')) || 1;
              var flipNormals = parseFloat(this.getAttribute('flip')) || true;

              var radiusSegments = thetaLength / 2;
              var heightSegments = 1;
              var length = thetaLength * Math.PI/180;
              var start;

              if (flipNormals) {
                start = (thetaStart + 180) * Math.PI/180; //subtracting length from start has effect of enabling designer to specify left edge position of the band (start), and extending band rightwards.
              } else {
                start = (thetaStart - thetaLength) * Math.PI/180;
              }

              var geometry = new THREE.CylinderGeometry( radius, radius, height, radiusSegments, heightSegments, true, start, length );

              if (flipNormals)  {
                geometry.applyMatrix( new THREE.Matrix4().makeScale(-1, 1, 1));
              }

              geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0-height/2, 0 ) ); //sets pivot to top of band

              return geometry;

            }
          },

          getMaterial: {
            value: function() {
              var materialId = this.getAttribute('material');
              var materialEl = materialId? document.querySelector('#' + materialId) : undefined;
              return (materialEl && materialEl.material) || new THREE.MeshNormalMaterial( { color: Math.random() * 0xffffff, opacity: 1.0 } );
            }
          }
        })
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-CURVEDPLANE2"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRCurvedPlane2',this));