/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  var proto = Object.create(
    VRNode.prototype, {
      createdCallback: {
        value: function() {
          var sceneEl = document.querySelector('vr-scene');
          this.sceneEl = sceneEl;
          this.sceneEl.addBehavior(this);
          this.init();
        }
      },

      // Tags that inherit from VRBehavior should define their own update
      // function.
      update: {
        value: function() { /* no op */}
      },
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-BEHAVIOR"] = true;
  module.exports = document.registerElement('vr-behavior', { prototype: proto });

});})(typeof define==='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module==='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRBehavior',this));
