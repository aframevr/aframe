/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  var proto = Object.create(
    HTMLElement.prototype, {
      createdCallback: {
        value: function() {
          this.setupScene();
        }
      },

      attachedCallback: {
        value: function() {
          console.log('live on DOM ;-) ');
        }
      },

      detachedCallback: {
        value: function() {
          console.log('leaving the DOM :-( )');
        }
      },

      attributeChangedCallback: {
        value: function(name, previousValue, value)
        {
          if (previousValue == null) {
            console.log(
              'got a new attribute ', name,
              ' with value ', value
            );
          } else if (value == null) {
            console.log(
              'somebody removed ', name,
              ' its value was ', previousValue
            );
          } else {
            console.log(
              name,
              ' changed from ', previousValue,
              ' to ', value
            );
          }
        }
      },

      setupScene: {
        value: function() {
          // The canvas where the WebGL contet will be painted
          this.setupCanvas();
          // three.js camera setup
          this.setupCamera();
          // The three.js renderer setup
          this.setupRenderer();
          this.setupCameraEl();
        }
      },

      setupCanvas: {
        value: function() {
          var canvas = this.canvas = document.createElement('canvas');
          canvas.classList.add('vr-canvas');
          document.body.appendChild(canvas);
          window.addEventListener('resize', this.resizeCanvas.bind(this), false);
        }
      },

      setupCamera: {
        value: function() {
          var camera = this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
          camera.position.z = 400;
        }
      },

      setupCameraEl: {
        value: function() {
          var cameraEl = document.createElement('vr-camera');
          cameraEl.camera = this.camera;
          var els = this.children;
          for (var i = 0; i < els.length; ++i) {
            cameraEl.appendChild(els[i]);
          }
          this.appendChild(cameraEl);
        }
      },

      setupRenderer: {
        value: function() {
          var canvas = this.canvas;
          var renderer = this.renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true, alpha: true } );
          renderer.setPixelRatio( window.devicePixelRatio );
          renderer.sortObjects = false;
          this.vrEffect = new THREE.VREffect(renderer);
          this.scene = new THREE.Scene();
          this.resizeCanvas();
        }
      },

      resizeCanvas: {
        value: function(){
          var canvas = this.canvas;
          var camera = this.camera;
          // Make it visually fill the positioned parent
          canvas.style.width ='100%';
          canvas.style.height='100%';
          // Set the internal size to match
          canvas.width  = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
          // Updates camera
          camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
          camera.updateProjectionMatrix();
          // Notify the renderer of the size change
          this.renderer.setSize( canvas.width, canvas.height );
          this.render();
        }
      },

      add: {
        value: function(el) {
          this.scene.add(el.object);
        }
      },

      render: {
        value: function() {
          this.renderer.render( this.scene, this.camera );
        }
      }
    }
  );

  // Registering element and exporting prototype
  module.exports = document.registerElement('vr-scene', { prototype: proto });

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRScene',this));