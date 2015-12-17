/* global MessageChannel, Promise */
var re = require('./a-register-element');
var RStats = require('../../lib/vendor/rStats');
var THREE = require('../../lib/three');
var TWEEN = require('tween.js');
var utils = require('../utils/');
var AEntity = require('./a-entity');
var Wakelock = require('../../lib/vendor/wakelock/wakelock');

var dummyDolly = new THREE.Object3D();
var controls = new THREE.VRControls(dummyDolly);
var isNode = re.isNode;
var DEFAULT_CAMERA_ATTR = 'data-aframe-default-camera';
var DEFAULT_LIGHT_ATTR = 'data-aframe-default-light';
var HIDDEN_CLASS = 'a-hidden';
var registerElement = re.registerElement;
var ENTER_VR_CLASS = 'a-enter-vr';
var ENTER_VR_NO_HEADSET = 'data-a-enter-vr-no-headset';
var ENTER_VR_NO_WEBVR = 'data-a-enter-vr-no-webvr';
var ENTER_VR_BTN_CLASS = 'a-enter-vr-button';
var ENTER_VR_MODAL_CLASS = 'a-enter-vr-modal';
var ORIENTATION_MODAL_CLASS = 'a-orientation-modal';
var isMobile = utils.isMobile();

/**
 * Scene element, holds all entities.
 *
 * @member {number} animationFrameID
 * @member {array} behaviors - Component instances that have registered themselves to be
           updated on every tick.
 * @member {object} cameraEl - Set the entity with a camera component.
 * @member {object} canvas
 * @member {bool} defaultLightsEnabled - false if user has not added lights.
 * @member {Element} enterVREl
 * @member {bool} insideIframe
 * @member {bool} insideLoader
 * @member {bool} isScene - Differentiates this as a scene entity as opposed
           to other `AEntity`s.
 * @member {bool} isMobile - Whether browser is mobile (via UA detection).
 * @member {object} object3D - The root three.js Scene object.
 * @member {object} monoRenderer
 * @member {number} pendingElements - Number of elements currently waiting to
 *         initialize before beginning rendering.
 * @member {object} renderer
 * @member {bool} renderLoopStarted
 * @member {object} stats
 * @member {object} stereoRenderer
 * @member {object} wakelock
 */
var AScene = module.exports = registerElement('a-scene', {
  prototype: Object.create(AEntity.prototype, {
    createdCallback: {
      value: function () {
        this.behaviors = [];
        this.defaultLightsEnabled = true;
        this.enterVREl = null;
        this.insideIframe = window.top !== window.self;
        this.insideLoader = false;
        this.isScene = true;
        this.materials = {};
        this.object3D = AScene.scene || new THREE.Scene();

        AScene.scene = this.object3D;
      }
    },

    attachedCallback: {
      value: function () {
        this.isMobile = isMobile;
        var resizeCanvas = this.resizeCanvas.bind(this);

        if (isMobile) {
          injectMetaTags();
          this.wakelock = new Wakelock();
        }

        this.setupStats();
        this.setupCanvas();
        this.setupKeyboardShortcuts();
        this.setupRenderer();
        this.setupDefaultLights();
        this.attachEventListeners();
        this.attachFullscreenListeners();
        this.attachOrientationListeners();

        // For Chrome (https://github.com/aframevr/aframe-core/issues/321).
        window.addEventListener('load', resizeCanvas);
      },
      writable: window.debug
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
        this.animationFrameID = null;
      }
    },

    /**
     * @param {object} behavior - Generally a component. Must implement a .update() method to
     *        be called on every tick.
     */
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
        var assets = document.querySelector('a-assets');
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
          node.addEventListener('loaded', elementLoadedCallback);
        }
      }
    },

    attachOrientationListeners: {
      value: function (e) {
        window.addEventListener('orientationchange', this.showOrientationModal.bind(this));
      }
    },

    showOrientationModal: {
      value: function () {
        if (!utils.isIOS()) { return; }
        if (!utils.isLandscape() && this.renderer === this.stereoRenderer) {
          this.orientationModal.classList.remove(HIDDEN_CLASS);
        } else {
          this.orientationModal.classList.add(HIDDEN_CLASS);
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
          } else {
            window.screen.orientation.unlock();
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
                self.removeEnterVRButton();
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

        // Kick off render loop.
        this.render();
        this.renderLoopStarted = true;
        this.load();
        this.checkUrlParameters();
      }
    },

    /**
     * Enters VR when ?mode=vr is specified in the querystring.
     */
    checkUrlParameters: {
      value: function () {
        var mode = utils.getUrlParameter('mode');
        if (mode === 'vr') {
          this.enterVR();
        }

        var ui = utils.getUrlParameter('ui');
        if (ui === 'false') {
          this.hideUI();
        }
      }
    },

    enterVR: {
      value: function () {
        this.hideUI();
        this.setStereoRenderer();
        this.setFullscreen();
        this.showOrientationModal();
      }
    },

    exitVR: {
      value: function () {
        this.showUI();
        this.setMonoRenderer();
        this.orientationModal.classList.add(HIDDEN_CLASS);
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
        if (this.statsEl) {
          this.statsEl.classList.add(HIDDEN_CLASS);
        }
        if (this.enterVREl) {
          this.enterVREl.classList.add(HIDDEN_CLASS);
        }
      }
    },

    load: {
      value: function () {
        // To prevent emmitting the loaded event more than once
        // and to prevent triggering loaded if there are still
        // pending elements to be loaded
        if (this.hasLoaded || this.pendingElements !== 0) { return; }
        AEntity.prototype.load.call(this);
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

    /**
     * Keep track of material in case an update trigger is needed (e.g., fog).
     *
     * @param {object} material
     */
    registerMaterial: {
      value: function (material) {
        this.materials[material.uuid] = material;
      }
    },

    /**
     * @param {object} behavior - Generally a component. Has registered itself to behaviors.
     */
    removeBehavior: {
      value: function (behavior) {
        var behaviors = this.behaviors;
        var index = behaviors.indexOf(behavior);
        if (index === -1) { return; }
        behaviors.splice(index, 1);
      }
    },

    removeEnterVR: {
      value: function () {
        if (this.enterVREl) {
          this.enterVREl.parentNode.removeChild(this.enterVREl);
        }
      }
    },

    resizeCanvas: {
      value: function () {
        // It's possible that the camera is not injected yet.
        if (!this.cameraEl) { return; }
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
        canvas.classList.add('a-canvas');
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
        cameraWrapperEl = document.createElement('a-entity');
        cameraWrapperEl.setAttribute('position', {x: 0, y: 1.8, z: 4});
        cameraWrapperEl.setAttribute(DEFAULT_CAMERA_ATTR, '');
        defaultCamera = document.createElement('a-entity');
        defaultCamera.setAttribute('camera');
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
        var ambientLight = document.createElement('a-entity');
        ambientLight.setAttribute('light',
                                  {color: '#fff', type: 'ambient'});
        ambientLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
        this.appendChild(ambientLight);

        var directionalLight = document.createElement('a-entity');
        directionalLight.setAttribute('light', { color: '#fff', intensity: 0.2 });
        directionalLight.setAttribute('position', { x: -1, y: 2, z: 1 });
        directionalLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
        this.appendChild(directionalLight);
      }
    },

    setupEnterVR: {
      value: function () {
        if (this.enterVREl) { return; }
        this.enterVREl = createEnterVR(this.enterVR.bind(this));
        document.body.appendChild(this.enterVREl);
      }
    },

    setupOrientationModal: {
      value: function () {
        var modal = this.orientationModal = document.createElement('div');
        modal.className = ORIENTATION_MODAL_CLASS;
        modal.classList.add(HIDDEN_CLASS);

        var exit = document.createElement('button');
        exit.innerHTML = 'Exit VR';
        exit.addEventListener('click', this.exitVR.bind(this));
        modal.appendChild(exit);

        document.body.appendChild(modal);
      }
    },

    /**
     * Set up keyboard shortcuts to:
     *   - Enter VR when `f` is pressed.
     *   - Reset sensor when `z` is pressed.
     */
    setupKeyboardShortcuts: {
      value: function () {
        var self = this;
        window.addEventListener('keyup', function (event) {
          if (event.keyCode === 70) {  // f.
            self.enterVR();
          }
          if (event.keyCode === 90) {  // z.
            controls.resetSensor();
          }
        }, false);
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
          self.setupEnterVR();
          self.setupOrientationModal();
        }
      }
    },

    setupRenderer: {
      value: function () {
        var canvas = this.canvas;
        // Set at startup. To enable/disable antialias
        // at runttime we would have to recreate the whole context
        var antialias = this.getAttribute('antialias') === 'true';
        var renderer = this.renderer = this.monoRenderer =
          (AScene && AScene.renderer) ||
          // To prevent creating multiple rendering contexts.
          new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: antialias,
            alpha: true
          });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.sortObjects = false;
        AScene.renderer = renderer;
        this.stereoRenderer = new THREE.VREffect(renderer);
      },
      writable: window.debug
    },

    /**
     * TODO: move stats to component.
     */
    setupStats: {
      value: function () {
        var statsEnabled = this.getAttribute('stats') === 'true';
        var statsEl = this.statsEl = document.querySelector('.rs-base');
        if (!statsEnabled) {
          if (statsEl) { statsEl.classList.add(HIDDEN_CLASS); }
          return;
        }
        if (statsEl) { statsEl.classList.remove(HIDDEN_CLASS); }
        if (this.stats) { return; }
        this.stats = new RStats({
          CSSPath: '../../style/',
          values: {
            fps: { caption: 'fps', below: 30 }
          },
          groups: [
            { caption: 'Framerate', values: [ 'fps', 'raf' ] }
          ]
        });
        this.statsEl = document.querySelector('.rs-base');
      }
    },

    showUI: {
      value: function () {
        var statsEnabled = this.getAttribute('stats') === 'true';
        if (statsEnabled) {
          this.statsEl.classList.remove(HIDDEN_CLASS);
        }
        if (this.enterVREl) {
          this.enterVREl.classList.remove(HIDDEN_CLASS);
        }
      }
    },

    /**
     * Stops tracking material.
     *
     * @param {object} material
     */
    unregisterMaterial: {
      value: function (material) {
        delete this.materials[material.uuid];
      }
    },

    /**
     * Trigger update to all registered materials.
     */
    updateMaterials: {
      value: function (material) {
        var materials = this.materials;
        Object.keys(materials).forEach(function (uuid) {
          materials[uuid].needsUpdate = true;
        });
      },
      writable: window.debug
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
          behavior.update();
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
 * Creates Enter VR flow (button and compatibility modal).
 *
 * Creates a button that when clicked will enter into stereo-rendering mode for VR.
 *
 * For compatibility:
 *   - Mobile always has compatibility via polyfill.
 *   - If desktop browser does not have WebVR excluding polyfill, disable button, show modal.
 *   - If desktop browser has WebVR excluding polyfill but not headset connected,
 *     don't disable button, but show modal.
 *   - If desktop browser has WebVR excluding polyfill and has headset connected, then
 *     then no modal.
 *
 * Structure: <div><modal/><button></div>
 *
 * @returns {Element} Wrapper <div>.
 */
function createEnterVR (enterVRHandler) {
  var compatModal;
  var compatModalLink;
  var compatModalText;
  // window.hasNativeVRSupport is set in src/aframe-core.js.
  var hasWebVR = isMobile || window.hasNonPolyfillWebVRSupport;
  var orientation;
  var vrButton;
  var wrapper;

  // Create elements.
  wrapper = document.createElement('div');
  wrapper.classList.add(ENTER_VR_CLASS);
  compatModal = document.createElement('div');
  compatModal.className = ENTER_VR_MODAL_CLASS;
  compatModalText = document.createElement('p');
  compatModalLink = document.createElement('a');
  compatModalLink.setAttribute('href', 'http://mozvr.com/#start');
  compatModalLink.setAttribute('target', '_blank');
  compatModalLink.innerHTML = 'Learn more.';
  vrButton = document.createElement('button');
  vrButton.className = ENTER_VR_BTN_CLASS;

  // Insert elements.
  if (compatModal) {
    compatModal.appendChild(compatModalText);
    compatModal.appendChild(compatModalLink);
    wrapper.appendChild(compatModal);
  }
  wrapper.appendChild(vrButton);

  if (!checkHeadsetConnected() && !isMobile) {
    compatModalText.innerHTML = 'Your browser supports WebVR. To enter VR, connect a headset, or use a mobile phone.';
    wrapper.setAttribute(ENTER_VR_NO_HEADSET, '');
  }

  // Handle enter VR flows.
  if (!hasWebVR) {
    compatModalText.innerHTML = 'Your browser does not support WebVR. To enter VR, use a VR-compatible browser, or a mobile phone.';
    wrapper.setAttribute(ENTER_VR_NO_WEBVR, '');
  } else {
    vrButton.addEventListener('click', enterVRHandler);
  }
  return wrapper;

  /**
   * Check for headset connection by looking at orientation {0 0 0}.
   */
  function checkHeadsetConnected () {
    controls.update();
    orientation = dummyDolly.quaternion;
    if (orientation._x !== 0 || orientation._y !== 0 || orientation._z !== 0) {
      return true;
    }
  }
}

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
