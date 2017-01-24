/* global Promise, screen */
var initMetaTags = require('./metaTags').inject;
var initWakelock = require('./wakelock');
var re = require('../a-register-element');
var scenes = require('./scenes');
var systems = require('../system').systems;
var THREE = require('../../lib/three');
var TWEEN = require('tween.js');
var utils = require('../../utils/');
// Require after.
var AEntity = require('../a-entity');
var ANode = require('../a-node');
var initPostMessageAPI = require('./postMessage');

var bind = utils.bind;
var isIOS = utils.device.isIOS();
var isMobile = utils.device.isMobile();
var registerElement = re.registerElement;
var warn = utils.debug('core:a-scene:warn');

/**
 * Scene element, holds all entities.
 *
 * @member {number} animationFrameID
 * @member {array} behaviors - Component instances that have registered themselves to be
           updated on every tick.
 * @member {object} camera - three.js Camera object.
 * @member {object} canvas
 * @member {bool} isScene - Differentiates as scene entity as opposed to other entites.
 * @member {bool} isMobile - Whether browser is mobile (via UA detection).
 * @member {object} object3D - Root three.js Scene object.
 * @member {object} renderer
 * @member {bool} renderStarted
 * @member (object) effect - three.js VREffect
 * @member {object} systems - Registered instantiated systems.
 * @member {number} time
 */
module.exports = registerElement('a-scene', {
  prototype: Object.create(AEntity.prototype, {
    defaultComponents: {
      value: {
        'canvas': '',
        'inspector': '',
        'keyboard-shortcuts': '',
        'screenshot': '',
        'vr-mode-ui': '',
        'auto-enter-vr': ''
      }
    },

    createdCallback: {
      value: function () {
        this.isIOS = isIOS;
        this.isMobile = isMobile;
        this.isScene = true;
        this.object3D = new THREE.Scene();
        this.render = bind(this.render, this);
        this.systems = {};
        this.time = 0;
        this.init();
      }
    },

    init: {
      value: function () {
        this.behaviors = [];
        this.hasLoaded = false;
        this.isPlaying = false;
        this.originalHTML = this.innerHTML;
        this.addEventListener('render-target-loaded', function () {
          this.setupRenderer();
          this.resize();
        });
        this.addFullScreenStyles();
        initPostMessageAPI(this);
      },
      writable: true
    },

    addFullScreenStyles: {
      value: function () {
        var htmlEl = document.documentElement;
        htmlEl.classList.add('a-html');
        document.body.classList.add('a-body');
        this.classList.add('fullscreen');
      }
    },

    removeFullScreenStyles: {
      value: function () {
        var htmlEl = document.documentElement;
        htmlEl.classList.remove('a-html');
        document.body.classList.remove('a-body');
        this.classList.remove('fullscreen');
      }
    },

    attachedCallback: {
      value: function () {
        var resize = bind(this.resize, this);
        initMetaTags(this);
        initWakelock(this);
        this.initSystems();

        window.addEventListener('load', resize);
        window.addEventListener('resize', resize);
        this.play();

        // Add to scene index.
        scenes.push(this);
      },
      writable: window.debug
    },

    initSystems: {
      value: function () {
        Object.keys(systems).forEach(bind(this.initSystem, this));
      }
    },

    initSystem: {
      value: function (name) {
        var system;
        if (this.systems[name]) { return; }
        system = this.systems[name] = new systems[name](this);
        system.init();
      }
    },

    /**
     * Shuts down scene on detach.
     */
    detachedCallback: {
      value: function () {
        var sceneIndex;
        window.cancelAnimationFrame(this.animationFrameID);
        this.animationFrameID = null;
        // Remove from scene index.
        sceneIndex = scenes.indexOf(this);
        scenes.splice(sceneIndex, 1);
      }
    },

    /**
     * @param {object} behavior - Generally a component. Must implement a .update() method to
     *        be called on every tick.
     */
    addBehavior: {
      value: function (behavior) {
        var behaviors = this.behaviors;
        if (behaviors.indexOf(behavior) !== -1) { return; }
        behaviors.push(behavior);
      }
    },

    /**
     * For tests.
     */
    checkHeadsetConnected: {
      value: utils.device.checkHeadsetConnected,
      writable: window.debug
    },

    /**
     * Call `requestPresent` if WebVR or WebVR polyfill.
     * Call `requestFullscreen` on desktop.
     * Handle events, states, fullscreen styles.
     *
     * @returns {Promise}
     */
    enterVR: {
      value: function (event) {
        var self = this;

        // Don't enter VR if already in VR.
        if (this.is('vr-mode')) { return Promise.resolve('Already in VR.'); }

        if (this.checkHeadsetConnected() || this.isMobile) {
          return this.effect.requestPresent().then(enterVRSuccess, enterVRFailure);
        }
        enterVRSuccess();
        return Promise.resolve();

        function enterVRSuccess () {
          self.addState('vr-mode');
          self.emit('enter-vr', event);

          // Lock to landscape orientation on mobile.
          if (self.isMobile && screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape');
          }
          self.addFullScreenStyles();

          // On mobile, the polyfill handles fullscreen.
          // TODO: 07/16 Chromium builds break when `requestFullscreen`ing on a canvas
          // that we are also `requestPresent`ing. Until then, don't fullscreen if headset
          // connected.
          if (!self.isMobile && !self.checkHeadsetConnected()) {
            requestFullscreen(self.canvas);
          }
          self.resize();
        }

        function enterVRFailure (err) {
          if (err && err.message) {
            throw new Error('Failed to enter VR mode (`requestPresent`): ' + err.message);
          } else {
            throw new Error('Failed to enter VR mode (`requestPresent`).');
          }
        }
      }
    },
     /**
     * Call `exitPresent` if WebVR or WebVR polyfill.
     * Handle events, states, fullscreen styles.
     *
     * @returns {Promise}
     */
    exitVR: {
      value: function () {
        var self = this;

        // Don't exit VR if not in VR.
        if (!this.is('vr-mode')) { return Promise.resolve('Not in VR.'); }

        exitFullscreen();

        if (this.checkHeadsetConnected() || this.isMobile) {
          return this.effect.exitPresent().then(exitVRSuccess, exitVRFailure);
        }
        exitVRSuccess();
        return Promise.resolve();

        function exitVRSuccess () {
          self.removeState('vr-mode');
          // Lock to landscape orientation on mobile.
          if (self.isMobile && screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
          // Exiting VR in embedded mode, no longer need fullscreen styles.
          if (self.hasAttribute('embedded')) { self.removeFullScreenStyles(); }
          self.resize();
          if (self.isIOS) { utils.forceCanvasResizeSafariMobile(this.canvas); }
          self.emit('exit-vr', {target: self});
        }

        function exitVRFailure (err) {
          if (err && err.message) {
            throw new Error('Failed to exit VR mode (`exitPresent`): ' + err.message);
          } else {
            throw new Error('Failed to exit VR mode (`exitPresent`).');
          }
        }
      }
    },

    /**
     * Wraps Entity.getAttribute to take into account for systems.
     * If system exists, then return system data rather than possible component data.
     */
    getAttribute: {
      value: function (attr) {
        var system = this.systems[attr];
        if (system) { return system.data; }
        return AEntity.prototype.getAttribute.call(this, attr);
      }
    },

    /**
     * `getAttribute` used to be `getDOMAttribute` and `getComputedAttribute` used to be
     * what `getAttribute` is now. Now legacy code.
     */
    getComputedAttribute: {
      value: function (attr) {
        warn('`getComputedAttribute` is deprecated. Use `getAttribute` instead.');
        this.getAttribute(attr);
      }
    },

    /**
     * Wraps Entity.getDOMAttribute to take into account for systems.
     * If system exists, then return system data rather than possible component data.
     */
    getDOMAttribute: {
      value: function (attr) {
        var system = this.systems[attr];
        if (system) { return system.data; }
        return AEntity.prototype.getDOMAttribute.call(this, attr);
      }
    },

    /**
     * Wraps Entity.setAttribute to take into account for systems.
     * If system exists, then skip component initialization checks and do a normal
     * setAttribute.
     */
    setAttribute: {
      value: function (attr, value, componentPropValue) {
        var system = this.systems[attr];
        if (system) {
          ANode.prototype.setAttribute.call(this, attr, value);
          return;
        }
        AEntity.prototype.setAttribute.call(this, attr, value, componentPropValue);
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

    resize: {
      value: function () {
        var camera = this.camera;
        var canvas = this.canvas;
        var embedded = this.getAttribute('embedded') && !this.is('vr-mode');
        var size;
        // Possible camera or canvas not injected yet.
        // ON MOBILE the webvr-polyfill relies on the fullscreen API to enter
        // VR mode. The canvas is resized by VREffect following the values returned
        // by getEyeParameters. We don't want to overwrite the size with the
        // windows width and height.
        if (!camera || !canvas || this.is('vr-mode') && isMobile) { return; }
        // Update camera.
        size = getCanvasSize(canvas, embedded);
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
        // Notify renderer of size change.
        this.renderer.setSize(size.width, size.height);
      },
      writable: window.debug
    },

    setupRenderer: {
      value: function () {
        var canvas = this.canvas;
        // Set at startup. To enable/disable antialias
        // at runttime we would have to recreate the whole context
        var antialias = this.getAttribute('antialias') === 'true';
        var renderer = this.renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          antialias: antialias || window.hasNativeWebVRImplementation,
          alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.sortObjects = false;
        this.effect = new THREE.VREffect(renderer);
      },
      writable: window.debug
    },

    /**
     * Handler attached to elements to help scene know when to kick off.
     * Scene waits for all entities to load.
     */
    play: {
      value: function () {
        var self = this;
        if (this.renderStarted) {
          AEntity.prototype.play.call(this);
          return;
        }

        this.addEventListener('loaded', function () {
          AEntity.prototype.play.call(this);  // .play() *before* render.

          // Wait for camera if necessary before rendering.
          if (this.camera) {
            startRender(this);
            return;
          }
          this.addEventListener('camera-set-active', function () { startRender(this); });

          function startRender (sceneEl) {
            if (sceneEl.renderStarted) { return; }

            sceneEl.resize();

            // Kick off render loop.
            if (sceneEl.renderer) {
              if (window.performance) {
                window.performance.mark('render-started');
              }
              sceneEl.render(0);
              sceneEl.renderStarted = true;
              sceneEl.emit('renderstart');
            }
          }
        });

        // setTimeout to wait for all nodes to attach and run their callbacks.
        setTimeout(function () {
          AEntity.prototype.load.call(self);
        });
      }
    },

    /**
     * Reload the scene to the original DOM content.
     *
     * @param {bool} doPause - Whether to reload the scene with all dynamic behavior paused.
     */
    reload: {
      value: function (doPause) {
        var self = this;
        if (doPause) { this.pause(); }
        this.innerHTML = this.originalHTML;
        this.init();
        ANode.prototype.load.call(this, play);
        function play () {
          if (!self.isPlaying) { return; }
          AEntity.prototype.play.call(self);
        }
      }
    },

    /**
     * Wrap `updateComponent` to not initialize the component if the component has a system
     * (aframevr/aframe#2365).
     */
    updateComponent: {
      value: function (componentName) {
        if (componentName in systems) { return; }
        AEntity.prototype.updateComponent.apply(this, arguments);
      }
    },

    /**
     * Behavior-updater meant to be called from scene render.
     * Abstracted to a different function to facilitate unit testing (`scene.tick()`) without
     * needing to render.
     */
    tick: {
      value: function (time, timeDelta) {
        var systems = this.systems;

        // Animations.
        TWEEN.update(time);
        // Components.
        this.behaviors.forEach(function (component) {
          if (!component.el.isPlaying) { return; }
          component.tick(time, timeDelta);
        });
        // Systems.
        Object.keys(systems).forEach(function (key) {
          if (!systems[key].tick) { return; }
          systems[key].tick(time, timeDelta);
        });
      }
    },

    /**
     * The render loop.
     *
     * Updates animations.
     * Updates behaviors.
     * Renders with request animation frame.
     */
    render: {
      value: function (time) {
        var effect = this.effect;
        var timeDelta = time - this.time;

        if (this.isPlaying) { this.tick(time, timeDelta); }

        this.animationFrameID = effect.requestAnimationFrame(this.render);
        effect.render(this.object3D, this.camera);
        this.time = time;
      },
      writable: true
    }
  })
});

/**
 * Return the canvas size where the scene will be rendered
 * It will be always the window size except when the scene
 * is embedded. The parent size will be returned in that case
 *
 * @param {object} canvasEl - the canvas element
 * @param {boolean} embedded - Is the scene embedded?
 */
function getCanvasSize (canvasEl, embedded) {
  if (embedded) {
    return {
      height: canvasEl.parentElement.offsetHeight,
      width: canvasEl.parentElement.offsetWidth
    };
  }
  return {
    height: window.innerHeight,
    width: window.innerWidth
  };
}

function requestFullscreen (canvas) {
  var requestFullscreen =
    canvas.requestFullscreen ||
    canvas.webkitRequestFullscreen ||
    canvas.mozRequestFullScreen ||  // The capitalized `S` is not a typo.
    canvas.msRequestFullscreen;
  requestFullscreen.apply(canvas);
}

function exitFullscreen () {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}
