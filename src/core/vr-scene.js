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
        defaults: {
          value: {
            lights: {
              // Default directional light.
              0: {
                color: new THREE.Vector3(1.0, 1.0, 1.0),
                direction: new THREE.Vector3(-0.5, 1.0, 0.5),
                position: new THREE.Vector3(0, 0, 0),
                intensity: 5.0
              }
            }
          }
        },

        attachedCallback: {
          value: function () {
            this.insideIframe = window.top !== window.self;
            this.insideLoader = false;
            this.lights = {};
            this.materials = {};
            this.vrButton = null;
            document.addEventListener('vr-markup-ready',
                                      this.attachEventListeners.bind(this));
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
              attachEventListener(assets);
            }

            var children = this.querySelectorAll('*');
            Array.prototype.slice.call(children).forEach(countElement);

            function countElement (node) {
              // We wait for all the elements inside the scene to load.
              if (!node.isVRNode) { return; }
              self.pendingElements++;
              if (!node.hasLoaded) {
                attachEventListener(node);
              } else {
                elementLoaded(node);
              }
            }

            function attachEventListener (node) {
              node.addEventListener('loaded', function () { elementLoaded(node); });
            }
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
          value: function (node) {
            this.pendingElements--;
            // If we still need to wait for more elements.
            if (this.pendingElements > 0) { return; }
            // If the render loop is already running.
            if (this.renderLoopStarted) { return; }
            this.setupLoader();
            this.cameraEl = this.querySelector('vr-object[camera]');
            if (!this.cameraEl) {
              // If there's no user defined camera we
              // introduce a default one
              this.setupCamera();
              return;
            }
            // TODO: initialize lights somewhere else.
            this.updateMaterials();
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
            this.behaviors = [];
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
            var defaultCamera;
            // If there's a user defined camera
            if (this.cameraEl) { return; }
            // We create a default camera
            defaultCamera = document.createElement('vr-object');
            defaultCamera.setAttribute('camera', {fov: 45});
            defaultCamera.addEventListener('loaded', this.elementLoaded.bind(this));
            this.appendChild(defaultCamera);
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
            var camera = this.cameraEl.components.camera.camera;
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
            var camera = this.cameraEl.components.camera.camera;
            TWEEN.update(t);
            // Updates behaviors
            this.behaviors.forEach(function (behavior) {
              behavior.update(t);
            });
            this.renderer.render(this.object3D, camera);
            this.animationFrameID = window.requestAnimationFrame(this.render.bind(this));
          }
        },

        /**
         * Registers light to the scene for the scene to keep track.
         * Light is kept track in a map such that it can be looked up and
         * updated in place if necessary.
         * Doing so will update all materials in the scene.
         *
         * @param light {object} light attributes (e.g., color, intensity).
         */
        registerLight: {
          value: function (light) {
            this.lights[light.id] = light;
            this.updateMaterials();
          }
        },

        /**
         * Transforms this.lights into an array. Uses default lights if no
         * lights have been registered.
         *
         * @param light {array} - array of lights.
         */
        getLightsAsArray: {
          value: function () {
            // Default lights prescribed if no lights set.
            var lights = Object.keys(this.lights).length
                         ? this.lights : this.defaults.lights;
            // Convert this.lights to array.
            return Object.keys(lights).map(function (id) {
              return lights[id];
            });
          }
        },

        /**
         * Registers material component for the scene to keep track.
         * Scene keeps track of materials in case of needed updates.
         *
         * @param id {number} ID of the material to keep track.
         * @param material {object} material component instance.
         */
        registerMaterial: {
          value: function (id, material) {
            this.materials[id] = material;
            material.updateLights(this.getLightsAsArray());
          }
        },

        /**
         * Updates all materials in the scene with the scene's lights.
         * Prescribes a default light if no lights are set.
         */
        updateMaterials: {
          value: function () {
            var self = this;
            // Convert this.lights to array.
            var lightsArr = self.getLightsAsArray();
            // Iterate through all materials to update lights.
            Object.keys(self.materials).forEach(function (id) {
              self.materials[id].updateLights(lightsArr);
            });
          }
        }
      }
    )
  }
);
