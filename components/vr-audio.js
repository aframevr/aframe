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

              var src = this.getAttribute('src');
              var volume = parseFloat(this.getAttribute('vol')) || 10;
              var loop = this.getAttribute('loop') || true;
              var sound = new THREE.Audio(listener);
              volume = volume * 10; // We multiple by ten so the user can define volume in more intuitive scale: 0-10.
              sound.source.start(0, 0);

              if(src){
                sound.load(src);
                sound.setVolume(volume);
                sound.setLoop(loop);
                sound.connect();
              }
              
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
