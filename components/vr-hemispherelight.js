/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-hemispherelight',
    {
      prototype: Object.create(
        VRObject.prototype, {
          init: {
            value: function() {
              var skyColor = parseFloat(this.getAttribute('skyColor')) || "#FFFFFF";
              var groundColor = parseFloat(this.getAttribute('groundColor')) || "#FFFFFF";
              var intensity = parseFloat(this.getAttribute('intensity')) || 1;
              this.object3D = new THREE.HemisphereLight( skyColor, groundColor, intensity );
              console.log(this.object3D)
              this.load();
            }
          },

          update: {
            value: function() {

            }            
          }
        })
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-HEMISPHERELIGHT"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRHemispherelight',this));
