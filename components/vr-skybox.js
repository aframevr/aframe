/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-skybox',
    {
      prototype: Object.create(
        VRObject.prototype, {
          init: {
            value: function() {

              var self = this;
              var size = parseFloat(this.getAttribute('size')) || 10000;
              
              var urlPrefix = this.getAttribute('src');
              var urls = [ urlPrefix + "right.jpg", urlPrefix + "left.jpg",
                  urlPrefix + "top.jpg", urlPrefix + "bottom.jpg",
                  urlPrefix + "front.jpg", urlPrefix + "back.jpg" ];
              
              var textureCube = THREE.ImageUtils.loadTextureCube( urls, THREE.CubeReflectionMapping, function(){ 
                self.load(); 
              });
              textureCube.format = THREE.RGBFormat;
              var shader = THREE.ShaderLib['cube'];
              var material = new THREE.ShaderMaterial({
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: shader.uniforms,
                side: THREE.BackSide
              });

              material.uniforms[ "tCube" ].value = textureCube;
              var geometry = new THREE.BoxGeometry( size, size, size, 1, 1, 1 )

              this.object3D = new THREE.Mesh( geometry, material );
            }
          },

          update: {
            // TODO: Am not sure what should go here...
          }
        })
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-SKYBOX"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRSkybox',this));
