/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-video',
    {
      prototype: Object.create(
        VRObject.prototype, {
          init: {
            value: function() {
              var material = this.getMaterial();
              var geometry = this.getGeometry();
              this.object3D = new THREE.Mesh(geometry, material);
              this.load();
            }
          },

          /* no `update` function needed */

          getGeometry: {
            value: function() {
              var width = parseFloat(this.getAttribute('width')) || 50;
              var height = parseFloat(this.getAttribute('height')) || 50;
              return new THREE.PlaneGeometry(width, height, 1, 1);
            }
          },

          getMaterial: {
            value: function() {
              var video = document.createElement('video');
              video.crossOrigin = 'anonymous';
              video.src = this.getAttribute('src');
              video.autoplay = this.hasAttribute('autoplay');
              video.loop = this.hasAttribute('loop');

              var texture = new THREE.VideoTexture(video);
              texture.minFilter = THREE.LinearFilter;
              texture.format = THREE.RGBFormat;
              texture.generateMipmaps = false;

              return new THREE.MeshBasicMaterial({
                map: texture,
              });
            }
          }
        })
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-VIDEO"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRVideo',this));
