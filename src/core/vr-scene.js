/* global MessageChannel, performance, Promise */
var re = require('../vr-register-element');
var RStats = require('../../lib/vendor/rStats');
var THREE = require('../../lib/three');
var TWEEN = require('tween.js');
var utils = require('../vr-utils');
var VRObject = require('./vr-object');
var Wakelock = require('../../lib/vendor/wakelock/wakelock');

var isNode = re.isNode;
var DEFAULT_LIGHT_ATTR = 'data-aframe-default-light';
var registerElement = re.registerElement;

/**
 * Scene element, holds all entities.
 *
 * @member {number} animationFrameID
 * @member {array} behaviors
 * @member {object} cameraEl - Set the entity with a camera component.
 * @member {object} canvas
 * @member {bool} defaultLightsEnabled - false if user has not added lights.
 * @member {bool} insideIframe
 * @member {bool} insideLoader
 * @member {bool} isScene - Differentiates this as a scene object as opposed
           to other VRObjects.
 * @member {bool} isMobile - Whether browser is mobile (via UA detection).
 * @member {object} object3D - The root three.js Scene object.
 * @member {object} monoRenderer
 * @member {number} pendingElements - Number of elements currently waiting to
 *         initialize before beginning rendering.
 * @member {object} renderer
 * @member {bool} renderLoopStarted
 * @member {object} stats
 * @member {object} stereoRenderer
 * @member {object} vrButton
 * @member {object} wakelock
 */
var VRScene = module.exports = registerElement('vr-scene', {
  prototype: Object.create(VRObject.prototype, {
    createdCallback: {
      value: function () {
        this.behaviors = [];
        this.defaultLightsEnabled = true;
        this.insideIframe = window.top !== window.self;
        this.insideLoader = false;
        this.isScene = true;
        this.object3D = VRScene.scene || new THREE.Scene();
        this.vrButton = null;
      }
    },

    attachedCallback: {
      value: function () {
        var isMobile = this.isMobile = utils.isMobile();
        var resizeCanvas = this.resizeCanvas.bind(this);

        if (isMobile) {
          injectMetaTags();
          this.wakelock = new Wakelock();
        }

        this.setupStats();
        this.setupCanvas();
        this.setupRenderer();
        this.setupDefaultLights();
        this.attachEventListeners();
        this.attachFullscreenListeners();

        // For Chrome (https://github.com/MozVR/aframe-core/issues/321).
        window.addEventListener('load', resizeCanvas);
      }
    },

    /**
     * Handle stats.
     * TODO: move stats to a component.
     */
    attributeChangedCallback: {
      value: function (attr, oldVal, newVal) {
        if (oldVal === newVal) { return; }
        if (attr === 'stats') { this.setupStats(); }
      }
    },

    /**
     * Shuts down scene on detach.
     */
    detachedCallback: {
      value: function () {
        window.cancelAnimationFrame(this.animationFrameID);
      }
    },

    addBehavior: {
      value: function (behavior) {
        this.behaviors.push(behavior);
      }
    },

    /**
     * Attaches event listeners to all assets and entities and wait for them
     * all to load before kicking things off.
     */
    attachEventListeners: {
      value: function () {
        var self = this;
        var elementLoadedCallback = this.elementLoadedCallback.bind(this);
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
            elementLoadedCallback(node);
          }
        }

        function attachEventListener (node) {
          node.addEventListener('loaded', function () {
            elementLoadedCallback(node);
          });
        }
      }
    },

    /**
     * Switch back to mono renderer if no longer in fullscreen VR.
     * Lock to landscape orientation on mobile when fullscreen.
     */
    attachFullscreenListeners: {
      value: function () {
        function fullscreenChange (e) {
          var fsElement = document.fullscreenElement ||
                          document.mozFullScreenElement ||
                          document.webkitFullscreenElement;
          // Lock to landscape orientation on mobile.
          if (fsElement && this.isMobile) {
            window.screen.orientation.lock('landscape');
          }
          if (!fsElement) {
            this.showUI();
            this.setMonoRenderer();
          }
          if (this.wakelock) { this.wakelock.release(); }
        }
        document.addEventListener('mozfullscreenchange',
                                  fullscreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange',
                                  fullscreenChange.bind(this));
      }
    },

    /**
     * Handles VR and fullscreen behavior for when we are inside an iframe.
     */
    attachMessageListeners: {
      value: function () {
        var self = this;
        window.addEventListener('message', function (e) {
          if (e.data) {
            switch (e.data.type) {
              case 'loaderReady': {
                self.insideLoader = true;
                self.removeEnterVrButton();
                break;
              }
              case 'fullscreen': {
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
          }
        });
      }
    },

    createEnterVrButton: {
      value: function () {
        if (this.vrButton) { return; }
        var vrButton = this.vrButton = document.createElement('button');
        vrButton.textContent = 'Enter VR';
        vrButton.classList.add('button');
        vrButton.classList.add('enter-vr');
        document.body.appendChild(vrButton);
        vrButton.addEventListener('click', this.enterVR.bind(this));
      }
    },

    /**
     * Handler attached to elements to help scene know when to kick off.
     * Scene waits for all entities to load.
     */
    elementLoadedCallback: {
      value: function () {
        this.pendingElements--;
        // Still waiting on elements.
        if (this.pendingElements > 0) { return; }
        // Render loop already running.
        if (this.renderLoopStarted) { return; }

        this.setupLoader();
        if (!this.cameraEl) {
          // Add default camera if user has not added one. Wait for it to load.
          this.setupDefaultCamera();
          return;
        }
        this.resizeCanvas();
        // Kick off the render loop.
        this.render(performance.now());
        this.renderLoopStarted = true;
        this.load();
      }
    },

    enterVR: {
      value: function () {
        this.hideUI();
        this.setStereoRenderer();
        this.setFullscreen();
      }
    },

    getCanvasSize: {
      value: function () {
        var canvas = this.canvas;
        if (this.isMobile) {
          return {
            height: window.innerHeight,
            width: window.innerWidth
          };
        }
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        return {
          height: canvas.offsetHeight,
          width: canvas.offsetWidth
        };
      }
    },

    hideUI: {
      value: function () {
        this.statsEl.classList.add('hidden');
        this.vrButton.classList.add('hidden');
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

    removeEnterVrButton: {
      value: function () {
        if (this.vrButton) {
          this.vrButton.parentNode.removeChild(this.vrButton);
        }
      }
    },

    resizeCanvas: {
      value: function () {
        var camera = this.cameraEl.components.camera.camera;
        var size = this.getCanvasSize();
        // Updates camera
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
        // Notify the renderer of the size change
        this.renderer.setSize(size.width, size.height, true);
      }
    },

    /**
     * Manually handles fullscreen for non-VR mobile where the renderer' VR
     * display is not polyfilled. Also sets wakelock for mobile in the process.
     *
     * Desktop just works so use the renderer.setFullScreen in that case.
     */
    setFullscreen: {
      value: function () {
        var canvas = this.canvas;

        if (!this.isMobile) {
          this.stereoRenderer.setFullScreen(true);
          return;
        }

        if (this.wakelock) { this.wakelock.request(); }

        if (canvas.requestFullscreen) {
          canvas.requestFullscreen();
        } else if (canvas.mozRequestFullScreen) {
          canvas.mozRequestFullScreen();
        } else if (canvas.webkitRequestFullscreen) {
          canvas.webkitRequestFullscreen();
        }
      }
    },

    /**
     * Sets renderer to mono (one eye) and resizes canvas.
     */
    setMonoRenderer: {
      value: function () {
        this.renderer = this.monoRenderer;
        this.resizeCanvas();
      }
    },

    /**
     * Sets renderer to stereo (two eyes) and resizes canvas.
     */
    setStereoRenderer: {
      value: function () {
        this.renderer = this.stereoRenderer;
        this.resizeCanvas();
      }
    },

    setupCanvas: {
      value: function () {
        var canvas = this.canvas = document.createElement('canvas');
        canvas.classList.add('vr-canvas');
        // Prevents overscroll on mobile devices.
        canvas.addEventListener('touchmove', function (evt) {
          evt.preventDefault();
        });
        document.body.appendChild(canvas);
        window.addEventListener('resize', this.resizeCanvas.bind(this), false);
      }
    },

    /**
     * Creates a default camera if user has not added one during the initial.
     * scene traversal.
     *
     * Default camera height is at human level (~1.8m) and back such that
     * entities at the origin (0, 0, 0) are well-centered.
     */
    setupDefaultCamera: {
      value: function () {
        var cameraWrapperEl;
        var defaultCamera;

        if (this.cameraEl) { return; }

        // DOM calls to create camera.
        cameraWrapperEl = document.createElement('vr-object');
        cameraWrapperEl.setAttribute('position', {x: 0, y: 1.8, z: 10});
        defaultCamera = document.createElement('vr-object');
        defaultCamera.setAttribute('camera', {fov: 45});
        defaultCamera.setAttribute('wasd-controls');
        defaultCamera.setAttribute('look-controls');
        this.pendingElements++;
        defaultCamera.addEventListener('loaded',
                                       this.elementLoadedCallback.bind(this));
        cameraWrapperEl.appendChild(defaultCamera);
        this.appendChild(cameraWrapperEl);
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
     * Checks for VR mode before kicking off render loop.
     */
    setupLoader: {
      value: function () {
        var self = this;

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

    /**
     * TODO: move stats to component.
     */
    setupStats: {
      value: function () {
        var statsEnabled = this.getAttribute('stats') === 'true';
        var statsEl = this.statsEl = document.querySelector('.rs-base');
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
        this.statsEl = document.querySelector('.rs-base');
      }
    },

    showUI: {
      value: function () {
        var statsEnabled = this.getAttribute('stats') === 'true';
        if (statsEnabled) {
          this.statsEl.classList.remove('hidden');
        }
        this.vrButton.classList.remove('hidden');
      }
    },

    /**
     * @returns {object} Promise that resolves a bool whether loader is in VR
     *          mode.
     */
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

    /**
     * The render loop.
     *
     * Updates stats.
     * Updates animations.
     * Updates behaviors.
     * Renders with request animation frame.
     */
    render: {
      value: function (t) {
        var camera = this.cameraEl.components.camera.camera;
        var stats = this.stats;

        if (stats) {
          stats('rAF').tick();
          stats('FPS').frame();
        }
        TWEEN.update(t);
        this.behaviors.forEach(function (behavior) {
          behavior.update(t);
        });
        this.renderer.render(this.object3D, camera);
        if (stats) { stats().update(); }
        this.animationFrameID = window.requestAnimationFrame(
          this.render.bind(this));
      }
    }
  })
});

/**
 * Injects the necessary metatags in the document for mobile support to:
 * 1. Prevent the user to zoom in the document
 * 2. Ensure that window.innerWidth and window.innerHeight have the correct
 *    values and the canvas is properly scaled
 * 3. To allow fullscreen mode when pinning a web app on the home screen on
 *    iOS.
 * Adapted from: https://www.reddit.com/r/web_design/comments/3la04p/
 *
 * @type {Object}
 */
function injectMetaTags () {
  var headEl;
  var meta = document.querySelector('meta[name="viewport"]');
  if (meta) { return; }  // Already exists.

  headEl = document.getElementsByTagName('head')[0];
  meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content =
    'width=device-width,initial-scale=1,shrink-to-fit=no,user-scalable=no';
  headEl.appendChild(meta);

  // iOS-specific meta tags for fullscreen when pinning to homescreen.
  meta = document.createElement('meta');
  meta.name = 'apple-mobile-web-app-capable';
  meta.content = 'yes';
  headEl.appendChild(meta);

  meta = document.createElement('meta');
  meta.name = 'apple-mobile-web-app-status-bar-style';
  meta.content = 'black';
  headEl.appendChild(meta);
}
