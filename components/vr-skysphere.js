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
              var radius = parseFloat(this.getAttribute('radius')) || 5000;
              return new THREE.SphereGeometry( radius, 64, 40 );
            }
          },

          getMaterial: {
            value: function() {
              var imgSrc = this.getAttribute('src');
              var color = this.getAttribute('color');
              var material = new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false });

              if(imgSrc){
                material.map = new THREE.ImageUtils.loadTexture(imgSrc);
              } else if(color) {
                material.color = new THREE.Color(color);
              } else {
                material.color = new THREE.Color("#CCCCCC");
              }

              return material;
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
