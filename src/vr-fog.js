/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-fog',
    {
      prototype: Object.create(
        VRNode.prototype, {
          init: {
            value: function() {
              this.fog = this.sceneEl.object3D.fog = new THREE.Fog( 0xefd1b5, 1.02, 500 );
              this.load();
            }
          }
        })
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-FOG"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRFog',this));
