/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-cursor',
    {
      prototype: Object.create(
        VRNode.prototype, {
          init: {
            value: function() {
              var camera = this.sceneEl.camera;
              var renderer = this.sceneEl.renderer;
              this.object3D = new THREE.Cursor(camera, renderer);
              this.load();
            }
          }
        })
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-CURSOR"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRFog',this));
