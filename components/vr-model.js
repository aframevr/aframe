/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-model',
    {
      prototype: Object.create(
        VRObject.prototype, {

          init: {
            value: function() {

              var self = this;
              var src = this.getAttribute('src');
              var scale = parseFloat(this.getAttribute('scale')) || 1;

              // TODO: enable user to pass in material, and have that material apply to all nodes in the loaded object.

              // TODO: load and playback animations from loaded models.

              // TODO: figure out lighting model. 
              // self.scene.add( new THREE.AmbientLight( 0xcccccc ) ); 

              var loader = new THREE.ColladaLoader();
              // loader.options.convertUpAxis = true; // Not sure if we need this. Doesn't appear to be the case. But it was in Three.js examples.
              loader.load( src, function ( collada ) {
                var dae = collada.scene;
                console.log(dae);
                // dae.scale.x = dae.scale.y = dae.scale.z = scale;
                // dae.updateMatrix();
                self.object3D = dae;
                self.load();
              });
            }
          },

          update: {
            value: function() {

              // Not sure what should go here...
              
            }
          }
        })
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-MODEL"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRModel',this));