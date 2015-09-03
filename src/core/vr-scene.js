/* global Promise */

var TWEEN = require('tween.js');

var THREE = require('../../lib/three');
var VRNode = require('./vr-node');

var VRScene = module.exports = document.registerElement(
  'vr-scene',
  {
    prototype: Object.create(
      VRNode.prototype, {
        createdCallback: {
          value: function() {
            this.attachEventListeners();
            this.attachFullscreenListeners();
            this.setupScene();
          }
        },

        detachedCallback: {
          value: function() {
            this.shutdown();
          }
        },

        shutdown: {
          value: function() {
            window.cancelAnimationFrame(this.animationFrameID);
          }
        },

        attachEventListeners: {
          value: function() {
            var self = this;
            var elementLoaded = this.elementLoaded.bind(this);
            this.pendingElements = 0;
            var assets = document.querySelector('vr-assets');
            if (assets && !assets.hasLoaded) {
              this.pendingElements++;
              assets.addEventListener('loaded', elementLoaded);
            }
            traverseDOM(this);

            function traverseDOM(node) {
              // We have to wait for the element
              // If the node it's not the scene itself
              // and it's a VR element
              // and the node has not loaded yet
              if (node !== self && self.isVRNode(node) && !node.hasLoaded) {
                attachEventListener(node);
                self.pendingElements++;
              }
              node = node.firstChild;
              while (node) {
                traverseDOM(node);
                node = node.nextSibling;
              }
            }
            function attachEventListener(node) {
              node.addEventListener('loaded', elementLoaded);
            }
          }
        },

        isVRNode: {
          value: function(node) {
            // To check if a DOM elemnt is a VR element
            // We should be checking for the prototype like this
            // if (VRNode.prototype.isPrototypeOf(node))
            // Safari and Chrome doesn't seem to have the proper
            // prototype attached to the node before the createdCallback
            // function is called. To determine that an element is a VR
            // related node we check if the tag name starts with VR-
            // This is fragile. We have to understand why the behaviour between
            // firefox and the other browsers
            // is not consistent. Firefox is the only one that behaves as one
            // expects: The nodes have the proper prototype attached to them at
            // any time during their lifecycle.
            return node.tagName && node.tagName.indexOf('VR-') === 0;
          }
        },

        attachMessageListeners: {
          value: function() {
            var self = this;
            window.addEventListener('message', function(e) {
              if (e.data && e.data.type === 'fullscreen') {
                switch (e.data.data) {
                  // set renderer with fullscreen VR enter and exit.
                  case 'enter':
                    self.setStereoRenderer();
                    break;
                  case 'exit':
                    self.setMonoRenderer();
                    break;
                }
              }
            });
          }
        },

        attachFullscreenListeners: {
          value: function() {
            // handle fullscreen changes
            document.addEventListener('mozfullscreenchange', this.fullscreenChange.bind(this));
            document.addEventListener('webkitfullscreenchange', this.fullscreenChange.bind(this));
          }
        },

        fullscreenChange: {
          value: function(e) {
            // switch back to the mono renderer if we have dropped out of fullscreen VR mode.
            var fsElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            if (!fsElement) {
              this.renderer = this.monoRenderer;
            }
          }
        },

        elementLoaded: {
          value: function() {
            this.pendingElements--;
            // If we still need to wait for more elements
            if (this.pendingElements > 0) { return; }
            // If the render loop is already running
            if (this.renderLoopStarted) { return; }
            this.setupLoader();
            this.resizeCanvas();
            // It kicks off the render loop
            this.render(performance.now());
            this.renderLoopStarted = true;
            this.load();
          }
        },

        createEnterVrButton: {
          value: function() {
            var vrButton = document.createElement('button');
            vrButton.textContent = 'Enter VR';
            vrButton.style.cssText = 'position: absolute; top: 10px; left: 10px; font-family: sans-serif;';
            document.body.appendChild(vrButton);
            vrButton.addEventListener('click', this.enterVR.bind(this));
          }
        },

        // returns a promise that resolves to true if loader is in VR mode.
        vrLoaderMode: {
          value: function() {
            return new Promise(function(resolve) {
              var channel = new MessageChannel();
              window.top.postMessage({type: 'checkVr'}, '*', [channel.port2]);
              channel.port1.onmessage = function (message) {
                resolve(!!message.data.data.isVr);
              };
            });
          }
        },

        setupLoader: {
          value: function() {
            var self = this;
            // inside loader, check for vr mode before kicking off render loop.
            if (window.top !== window.self) {
              self.attachMessageListeners();
              self.vrLoaderMode().then(function(isVr) {
                if (isVr) {
                  self.setStereoRenderer();
                } else {
                  self.setMonoRenderer();
                }
                window.top.postMessage({type: 'ready'}, '*');
              });
            } else {
              self.createEnterVrButton();
            }
          }
        },

        setStereoRenderer: {
          value: function() {
            this.renderer = this.stereoRenderer;
            this.resizeCanvas();
          }
        },

        setMonoRenderer: {
          value: function() {
            this.renderer = this.monoRenderer;
            this.resizeCanvas();
          }
        },

        setupScene: {
          value: function() {
            this.behaviors = [];
            this.cameraControls = this.querySelector('vr-controls');
            if (this.cameraControls) {
              this.behaviors.push(this.cameraControls);
            }
            // The canvas where the WebGL context will be painted
            this.setupCanvas();
            // The three.js renderer setup
            this.setupRenderer();
            // three.js camera setup
            this.setupCamera();
            // cursor camera setup
            this.setupCursor();
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
            var cameraEl = this.querySelector('vr-camera');
            // If there's not a user-defined camera, we create one.
            if (!cameraEl) {
              cameraEl = document.createElement('vr-camera');
              cameraEl.setAttribute('fov', 45);
              cameraEl.setAttribute('near', 1);
              cameraEl.setAttribute('far', 10000);
              this.appendChild(cameraEl);
            }
          }
        },

        setupCursor: {
          value: function() {
            var cursor = this.querySelector('vr-cursor');
            if (cursor) {
              this.cursor = cursor;
            }
          }
        },

        enterVR: {
          value: function() {
            this.renderer = this.stereoRenderer;
            this.stereoRenderer.setFullScreen(true);
          }
        },

        setupRenderer: {
          value: function() {
            var canvas = this.canvas;
            var renderer = this.renderer = this.monoRenderer =
              (VRScene && VRScene.renderer) || // To prevent creating multiple rendering contexts
              new THREE.WebGLRenderer( { canvas: canvas, antialias: true, alpha: true } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.sortObjects = false;
            VRScene.renderer = renderer;

            this.stereoRenderer = new THREE.VREffect(renderer);

            this.object3D = (VRScene && VRScene.scene) || new THREE.Scene();
            VRScene.scene = this.object3D;
          }
        },

        resizeCanvas: {
          value: function() {
            var canvas = this.canvas;
            var camera = this.camera;
            // Make it visually fill the positioned parent
            canvas.style.width = '100%';
            canvas.style.height =' 100%';
            // Set the internal size to match
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            // Updates camera
            camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
            camera.updateProjectionMatrix();
            // Notify the renderer of the size change
            this.renderer.setSize( canvas.width, canvas.height );
          }
        },

        add: {
          value: function(el) {
            if (!el.object3D) { return; }
            this.object3D.add(el.object3D);
          }
        },

        addBehavior: {
          value: function(behavior) {
            this.behaviors.push(behavior);
          }
        },

        remove: {
          value: function(el) {
            if (!el.object3D) { return; }
            this.object3D.remove(el.object3D);
          }
        },

        render: {
          value: function(t) {
            TWEEN.update(t);
            // Updates behaviors
            this.behaviors.forEach(function(behavior) { behavior.update(t); });
            this.renderer.render( this.object3D, this.camera );
            this.animationFrameID = window.requestAnimationFrame(this.render.bind(this));
          }
        }
      }
    )
  }
);
