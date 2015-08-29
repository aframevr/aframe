/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-audio',
    {
      prototype: Object.create(
        VRObject.prototype, {
          init: {
            value: function() {
              var listener = new THREE.AudioListener;
              document.querySelector('vr-camera').object3D.add(listener);

              var sound = new THREE.Audio(listener);
              sound.load(this.getAttribute('src'));
              sound.setLoop(this.hasAttribute('loop'));
              sound.connect();
              sound.source.start(0, 0);
              this.object3D = sound;

              this.load();
            }
          },
        })
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-AUDIO"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRAudio',this));
