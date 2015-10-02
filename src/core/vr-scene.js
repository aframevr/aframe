/* global MessageChannel, performance, Promise */

var registerElement = require('../vr-register-element');

var THREE = require('../../lib/three');
var TWEEN = require('tween.js');
var VRNode = require('./vr-node');

var VRScene = module.exports = registerElement(
  'vr-scene',
  {
    prototype: Object.create(
      VRNode.prototype, {
        attachedCallback: {
          value: function () {
            this.insideIframe = window.top !== window.self;
            this.insideLoader = false;
            this.vrButton = null;
            document.addEventListener('vr-markup-ready', this.attachEventListeners.bind(this));
            this.attachFullscreenListeners();
            this.setupScene();
          }
        },

        detachedCallback: {
          value: function () {
            this.shutdown();
          }
        },

        shutdown: {
          value: function () {
            window.cancelAnimationFrame(this.animationFrameID);
          }
        },

        attachEventListeners: {
          value: function () {
            var self = this;
            var elementLoaded = this.elementLoaded.bind(this);
            this.pendingElements = 0;
            var assets = document.querySelector('vr-assets');
            if (assets && !assets.hasLoaded) {
              this.pendingElements++;
              assets.addEventListener('loaded', elementLoaded);
            }

            var children = this.querySelectorAll('*');
            Array.prototype.slice.call(children).forEach(countElement);
            if (!this.pendingElements) {
              elementLoaded();
            }

            function countElement (node) {
              // We wait for all the elements inside the scene to load.
              if (!self.isVRNode(node)) { return; }
              var isCamera = node.components && node.components.camera;
              if (isCamera) { self.cameraEl = node; }
              if (!node.hasLoaded) {
                attachEventListener(node);
                self.pendingElements++;
              }
            }

            function attachEventListener (node) {
              node.addEventListener('loaded', elementLoaded);
            }
          }
        },

        isVRNode: {
          value: function (node) {
            return VRNode.prototype.isPrototypeOf(node);
          }
        },

        attachMessageListeners: {
          value: function () {
            var self = this;
            window.addEventListener('message', function (e) {
              if (e.data) {
                switch (e.data.type) {
                  case 'loaderReady':
                    self.insideLoader = true;
                    self.removeEnterVrButton();
                    break;
                  case 'fullscreen':
                    switch (e.data.data) {
                      // Set renderer with fullscreen VR enter and exit.
                      case 'enter':
                        self.setStereoRenderer();
                        break;
                      case 'exit':
                        self.setMonoRenderer();
                        break;
                    }
                }
              }
            });
          }
        },

        attachFullscreenListeners: {
          value: function () {
            // handle fullscreen changes
            document.addEventListener('mozfullscreenchange', this.fullscreenChange.bind(this));
            document.addEventListener('webkitfullscreenchange', this.fullscreenChange.bind(this));
          }
        },

        fullscreenChange: {
          value: function (e) {
            // switch back to the mono renderer if we have dropped out of fullscreen VR mode.
            var fsElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            if (!fsElement) {
              this.renderer = this.monoRenderer;
            }
          }
        },

        elementLoaded: {
          value: function () {
            this.pendingElements--;
            // If we still need to wait for more elements.
            if (this.pendingElements > 0) { return; }
            // If the render loop is already running.
            if (this.renderLoopStarted) { return; }
            // If somehow there's not a camera.
            if (!this.cameraEl) { return console.error('Expected a camera element'); }

            this.setupLoader();
            // three.js camera setup.
            this.setupCamera();
            this.resizeCanvas();
            // Kick off the render loop.
            this.render(performance.now());
            this.renderLoopStarted = true;
            this.load();
          }
        },

        createEnterVrButton: {
          value: function () {
            var vrButton = this.vrButton = document.createElement('button');
            vrButton.textContent = 'Enter VR';
            vrButton.className = 'vr-button';
            document.body.appendChild(vrButton);
            vrButton.addEventListener('click', this.enterVR.bind(this));
          }
        },

        removeEnterVrButton: {
          value: function () {
            if (this.vrButton) {
              this.vrButton.parentNode.removeChild(this.vrButton);
            }
          }
        },

        // returns a promise that resolves to true if loader is in VR mode.
        vrLoaderMode: {
          value: function () {
            return new Promise(function (resolve) {
              var channel = new MessageChannel();
              window.top.postMessage({type: 'checkVr'}, '*', [channel.port2]);
              channel.port1.onmessage = function (message) {
                resolve(!!message.data.data.isVr);
              };
            });
          }
        },

        setupLoader: {
          value: function () {
            var self = this;

            // Inside loader, check for VR mode before kicking off render loop.
            if (self.insideIframe) {
              self.attachMessageListeners();
              self.vrLoaderMode().then(function (isVr) {
                if (isVr) {
                  self.setStereoRenderer();
                } else {
                  self.setMonoRenderer();
                }
                window.top.postMessage({type: 'ready'}, '*');
              });
            }

            if (!self.insideLoader) {
              self.createEnterVrButton();
            }
          }
        },

        setStereoRenderer: {
          value: function () {
            this.renderer = this.stereoRenderer;
            this.resizeCanvas();
          }
        },

        setMonoRenderer: {
          value: function () {
            this.renderer = this.monoRenderer;
            this.resizeCanvas();
          }
        },

        setupScene: {
          value: function () {
            // Three.js setup
            // We reuse the scene if there's already one
            this.object3D = (VRScene && VRScene.scene) || new THREE.Scene();
            VRScene.scene = this.object3D;

            this.behaviors = this.querySelectorAll('vr-controls');
            // querySelectorAll returns a NodeList that it's not a normal array
            // We need to convert
            this.behaviors = Array.prototype.slice.call(this.behaviors);
            // The canvas where the WebGL context will be painted
            this.setupCanvas();
            // The three.js renderer setup
            this.setupRenderer();
            // cursor camera setup
            this.setupCursor();
          }
        },

        setupCanvas: {
          value: function () {
            var canvas = this.canvas = document.createElement('canvas');
            canvas.classList.add('vr-canvas');
            document.body.appendChild(canvas);
            window.addEventListener('resize', this.resizeCanvas.bind(this), false);
          }
        },

        setupCamera: {
          value: function () {
            var cameraEl;
            // If there's a user defined camera
            if (this.cameraEl) { return; }
            // We create a default camera
            cameraEl = document.createElement('vr-object');
            this.cameraEl = cameraEl;
            cameraEl.setAttribute('camera', 'fov: 45');
            this.appendChild(cameraEl);
          }
        },

        setupCursor: {
          value: function () {
            var cursor = this.querySelector('vr-cursor');
            if (cursor) {
              this.cursor = cursor;
            }
          }
        },

        enterVR: {
          value: function () {
            this.renderer = this.stereoRenderer;
            this.stereoRenderer.setFullScreen(true);
          }
        },

        setupRenderer: {
          value: function () {
            var canvas = this.canvas;
            var renderer = this.renderer = this.monoRenderer =
              (VRScene && VRScene.renderer) || // To prevent creating multiple rendering contexts
              new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.sortObjects = false;
            VRScene.renderer = renderer;
            this.stereoRenderer = new THREE.VREffect(renderer);
          }
        },

        resizeCanvas: {
          value: function () {
            var canvas = this.canvas;
            var camera = this.cameraEl.components.camera.data.camera;
            // Make it visually fill the positioned parent
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            // Set the internal size to match
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            // Updates camera
            camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
            camera.updateProjectionMatrix();
            // Notify the renderer of the size change
            this.renderer.setSize(canvas.width, canvas.height);
          }
        },

        add: {
          value: function (el) {
            if (!el.object3D) { return; }
            this.object3D.add(el.object3D);
          }
        },

        addBehavior: {
          value: function (behavior) {
            this.behaviors.push(behavior);
          }
        },

        remove: {
          value: function (el) {
            if (!el.object3D) { return; }
            this.object3D.remove(el.object3D);
          }
        },

        render: {
          value: function (t) {
            var camera = this.cameraEl.components.camera.data.camera;
            TWEEN.update(t);
            // Updates behaviors
            this.behaviors.forEach(function (behavior) {
              behavior.update(t);
            });
            this.renderer.render(this.object3D, camera);
            this.animationFrameID = window.requestAnimationFrame(this.render.bind(this));
          }
        }
      }
    )
  }
);
