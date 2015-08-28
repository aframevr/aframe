/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-fog',
    {
      prototype: Object.create(
        VRNode.prototype, {
          init: {
            value: function() {
              var color = this.getAttribute('color') || 0xFFFFFF;
              var near = parseFloat(this.getAttribute('near')) || 1;
              var far = parseFloat(this.getAttribute('far')) || 1000;
              this.fog = this.sceneEl.object3D.fog = new THREE.Fog( color, near, far );
              this.load();
            }
          },

          update: {
            value: function() {
              // TODO: DOES ANYTHING NEED TO BE IN UPDATE?
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
