/* global MessageChannel, performance, Promise */
var re = require('../vr-register-element');
var registerElement = re.registerElement;
var isNode = re.isNode;

var THREE = require('../../lib/three');
var RStats = require('../../lib/vendor/rStats');
var Wakelock = require('../../lib/vendor/wakelock/wakelock');
var TWEEN = require('tween.js');
var VRNode = require('./vr-node');
var utils = require('../vr-utils');

var DEFAULT_LIGHT_ATTR = 'data-aframe-default-light';

var VRScene = module.exports = registerElement(
  'vr-scene',
  {
    prototype: Object.create(
      VRNode.prototype, {
        attributeChangedCallback: {
          value: function (attr, oldVal, newVal) {
            if (oldVal === newVal) { return; }
            if (attr === 'stats') { this.setupStats(); }
          }
        },

        attachedCallback: {
          value: function () {
            this.insideIframe = window.top !== window.self;
            this.insideLoader = false;
            this.defaultLightsEnabled = true;
            this.vrButton = null;
            this.setupStats();
            this.setupScene();
            this.attachEventListeners();
            this.attachFullscreenListeners();
            this.isMobile = utils.isMobile();
            // Setup wakelock for mobile.
            if (this.isMobile) this.wakelock = new Wakelock();
            // For Chrome: https://github.com/MozVR/aframe-core/issues/321
            window.addEventListener('load', this.resizeCanvas.bind(this));
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
              if (!isNode(node)) { return; }
              self.pendingElements++;
              if (!node.hasLoaded) {
                attachEventListener(node);
              } else {
                elementLoaded(node);
              }
            }

            function attachEventListener (node) {
              node.addEventListener('loaded', function () {
                elementLoaded(node);
              });
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
            document.addEventListener('mozfullscreenchange',
                                      this.fullscreenChange.bind(this));
            document.addEventListener('webkitfullscreenchange',
                                      this.fullscreenChange.bind(this));
          }
        },

        fullscreenChange: {
          value: function (e) {
            // Switch back to the mono renderer if we have dropped out of
            // fullscreen VR mode.
            var fsElement = document.fullscreenElement ||
                            document.mozFullScreenElement ||
                            document.webkitFullscreenElement;

            // Lock to landsape orientation on mobile.
            if (fsElement && this.isMobile) {
              window.screen.orientation.lock('landscape');
            }

            // No longer fullscreen/VR mode.
            if (!fsElement) {
              this.renderer = this.monoRenderer;
            }

            if (this.wakelock) {
              this.wakelock.release();
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
            this.setupLoader();
            if (!this.cameraEl) {
              // If there's no user defined camera we
              // introduce a default one
              this.setupCamera();
              return;
            }
            this.resizeCanvas();
            // Kick off the render loop.
            this.render(performance.now());
            this.renderLoopStarted = true;
            this.load();
          }
        },

        createEnterVrButton: {
          value: function () {
            if (this.vrButton) { return; }
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

        setupStats: {
          value: function () {
            var statsEnabled = this.getAttribute('stats') === 'true';
            var statsEl = document.querySelector('.rs-base');
            if (!statsEnabled) {
              if (statsEl) { statsEl.classList.add('hidden'); }
              return;
            }
            if (statsEl) { statsEl.classList.remove('hidden'); }
            if (this.stats) { return; }
            this.stats = new RStats({
              CSSPath: '../../style/',
              values: {
                fps: { caption: 'Framerate (FPS)', below: 30 }
              },
              groups: [
                { caption: 'Framerate', values: [ 'fps' ] }
              ]
            });
          }
        },

        setupScene: {
          value: function () {
            // Three.js setup
            // We reuse the scene if there's already one
            var scene = this.object3D = (VRScene && VRScene.scene) || new THREE.Scene();
            VRScene.scene = scene;
            this.behaviors = [];
            // The canvas where the WebGL context will be painted
            this.setupCanvas();
            // The three.js renderer setup
            this.setupRenderer();
            // cursor camera setup
            this.setupCursor();
            this.setupDefaultLights();
          }
        },

        setupCanvas: {
          value: function () {
            var canvas = this.canvas = document.createElement('canvas');
            canvas.classList.add('vr-canvas');
            // Prevents overscroll on mobile devices
            canvas.addEventListener('touchmove', function (evt) { evt.preventDefault(); });
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
            // Default camera height at human level, and back such that
            // objects at (0, 0, 0) are perfectly framed.
            defaultCamera.setAttribute('position', {x: 0, y: 1.8, z: 10});
            defaultCamera.setAttribute('controls', {mouseLook: true, locomotion: true});
            this.pendingElements++;
            defaultCamera.addEventListener('loaded',
                                           this.elementLoaded.bind(this));
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

        /**
         * Prescibe default lights to the scene.
         * Does so by injecting markup such that this state is not invisible.
         * These lights are removed if the user adds any lights.
         */
        setupDefaultLights: {
          value: function () {
            var ambientLight = document.createElement('vr-object');
            ambientLight.setAttribute('light',
                                      {color: '#bebebe', type: 'ambient'});
            ambientLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
            this.appendChild(ambientLight);

            var directionalLight = document.createElement('vr-object');
            directionalLight.setAttribute('light', {intensity: 2.5});
            directionalLight.setAttribute('position', {x: -10, y: 20, z: 10});
            directionalLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
            this.appendChild(directionalLight);
          }
        },

        /**
         * Notify scene that light has been added and to remove the default
         *
         * @param {object} el - element holding the light component.
         */
        registerLight: {
          value: function (el) {
            if (this.defaultLightsEnabled &&
                !el.hasAttribute(DEFAULT_LIGHT_ATTR)) {
              // User added a light, remove default lights through DOM.
              var defaultLights = document.querySelectorAll(
                '[' + DEFAULT_LIGHT_ATTR + ']');
              for (var i = 0; i < defaultLights.length; i++) {
                this.removeChild(defaultLights[i]);
              }
              this.defaultLightsEnabled = false;
            }
          }
        },

        enterVR: {
          value: function () {
            this.renderer = this.stereoRenderer;
            this.setFullscreen();
          }
        },

        setFullscreen: {
          value: function () {
            var canvas = this.canvas;
            // Use the fullscreen method on effect when on desktop.
            if (!this.isMobile) {
              this.stereoRenderer.setFullScreen(true);
              return;
            }

            // set wakelock for mobile devices.
            this.wakelock.request();

            // For non-VR enabled mobile devices, the controls are polyfilled, but not the
            // vrDisplay, so the fullscreen method on the effect renderer does not work and
            // we request it here manually instead.
            if (canvas.requestFullscreen) {
              canvas.requestFullscreen();
            } else if (canvas.mozRequestFullScreen) {
              canvas.mozRequestFullScreen();
            } else if (canvas.webkitRequestFullscreen) {
              canvas.webkitRequestFullscreen();
            }
          }
        },

        setupRenderer: {
          value: function () {
            var canvas = this.canvas;
            var renderer = this.renderer = this.monoRenderer =
              (VRScene && VRScene.renderer) ||
              // To prevent creating multiple rendering contexts.
              new THREE.WebGLRenderer({canvas: canvas, antialias: true,
                                       alpha: true});
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
            var stats = this.stats;
            if (stats) {
              stats('rAF').tick();
              stats('FPS').frame();
            }
            var camera = this.cameraEl.components.camera.camera;
            TWEEN.update(t);
            // Updates behaviors
            this.behaviors.forEach(function (behavior) {
              behavior.update(t);
            });
            this.renderer.render(this.object3D, camera);
            if (stats) { stats().update(); }
            this.animationFrameID = window.requestAnimationFrame(
              this.render.bind(this));
          }
        }
      }
    )
  }
);
