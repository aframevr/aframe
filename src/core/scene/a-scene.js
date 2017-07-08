/* global Promise, screen */
var initMetaTags = require('./metaTags').inject;
var initWakelock = require('./wakelock');
var re = require('../a-register-element');
var scenes = require('./scenes');
var systems = require('../system').systems;
var THREE = require('../../lib/three');
var TWEEN = require('@tweenjs/tween.js');
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
module.exports.AScene = registerElement('a-scene', {
  prototype: Object.create(AEntity.prototype, {
    defaultComponents: {
      value: {
        'canvas': '',
        'inspector': '',
        'keyboard-shortcuts': '',
        'screenshot': '',
        'vr-mode-ui': ''
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
        this.behaviors = { tick: [], tock: [] };
        this.hasLoaded = false;
        this.isPlaying = false;
        this.originalHTML = this.innerHTML;
        this.renderTarget = null;
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
        var resize;
        var self = this;

        initMetaTags(this);
        initWakelock(this);
        this.initSystems();

        resize = bind(this.resize, this);
        window.addEventListener('load', resize);
        window.addEventListener('resize', resize);
        this.play();

        // Add to scene index.
        scenes.push(this);

        // Handler to exit VR (e.g., Oculus Browser back button).
        this.onVRPresentChangeBound = bind(this.onVRPresentChange, this);
        window.addEventListener('vrdisplaypresentchange', this.onVRPresentChangeBound);

        // Enter VR on `vrdisplayactivate` (e.g. putting on Rift headset).
        window.addEventListener('vrdisplayactivate', function () { self.enterVR(); });

        // Exit VR on `vrdisplaydeactivate` (e.g. taking off Rift headset).
        window.addEventListener('vrdisplaydeactivate', function () { self.exitVR(); });
      },
      writable: window.debug
    },

    /**
     * Initialize all systems.
     */
    initSystems: {
      value: function () {
        Object.keys(systems).forEach(bind(this.initSystem, this));
      }
    },

    /**
     * Initialize a system.
     */
    initSystem: {
      value: function (name) {
        if (this.systems[name]) { return; }
        this.systems[name] = new systems[name](this);
      }
    },

    /**
     * Shut down scene on detach.
     */
    detachedCallback: {
      value: function () {
        var sceneIndex;

        if (this.effect && this.effect.cancelAnimationFrame) {
          this.effect.cancelAnimationFrame(this.animationFrameID);
        } else {
          window.cancelAnimationFrame(this.animationFrameID);
        }
        this.animationFrameID = null;

        // Remove from scene index.
        sceneIndex = scenes.indexOf(this);
        scenes.splice(sceneIndex, 1);

        window.removeEventListener('vrdisplaypresentchange', this.onVRPresentChangeBound);
      }
    },

    /**
     * Add ticks and tocks.
     *
     * @param {object} behavior - Generally a component. Must implement a .update() method
     *   to be called on every tick.
     */
    addBehavior: {
      value: function (behavior) {
        var self = this;
        var behaviors = this.behaviors;
        // Check if behavior has tick and/or tock and add the behavior to the appropriate list.
        Object.keys(behaviors).forEach(function (behaviorType) {
          if (!behavior[behaviorType]) { return; }
          var behaviorArr = self.behaviors[behaviorType];
          if (behaviorArr.indexOf(behavior) === -1) {
            behaviorArr.push(behavior);
          }
        });
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
     * @param {bool} fromExternal - Whether exiting VR due to an external event (e.g.,
     *   manually calling requestPresent via WebVR API directly).
     * @returns {Promise}
     */
    enterVR: {
      value: function (fromExternal) {
        var self = this;

        // Don't enter VR if already in VR.
        if (this.is('vr-mode')) { return Promise.resolve('Already in VR.'); }

        // Enter VR via WebVR API.
        if (!fromExternal && (this.checkHeadsetConnected() || this.isMobile)) {
          return this.effect.requestPresent().then(enterVRSuccess, enterVRFailure);
        }

        // Either entered VR already via WebVR API or VR not supported.
        enterVRSuccess();
        return Promise.resolve();

        function enterVRSuccess () {
          self.addState('vr-mode');
          self.emit('enter-vr', {target: self});

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
     * @param {bool} fromExternal - Whether exiting VR due to an external event (e.g.,
     *   Oculus Browser GearVR back button).
     * @returns {Promise}
     */
    exitVR: {
      value: function (fromExternal) {
        var self = this;

        // Don't exit VR if not in VR.
        if (!this.is('vr-mode')) { return Promise.resolve('Not in VR.'); }

        exitFullscreen();

        // Handle exiting VR if not yet already and in a headset or polyfill.
        if (!fromExternal && (this.checkHeadsetConnected() || this.isMobile)) {
          return this.effect.exitPresent().then(exitVRSuccess, exitVRFailure);
        }

        // Handle exiting VR in all other cases (2D fullscreen, external exit VR event).
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
     * Handle `vrdisplaypresentchange` event for exiting VR through other means than
     * `<ESC>` key. For example, GearVR back button on Oculus Browser.
     */
    onVRPresentChange: {
      value: function (evt) {
        // Entering VR.
        if (evt.display.isPresenting) {
          this.enterVR(true);
          return;
        }
        // Exiting VR.
        this.exitVR(true);
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
     * Wrap Entity.setAttribute to take into account for systems.
     * If system exists, then skip component initialization checks and do a normal
     * setAttribute.
     */
    setAttribute: {
      value: function (attr, value, componentPropValue) {
        var system = this.systems[attr];
        if (system) {
          ANode.prototype.setAttribute.call(this, attr, value);
          system.updateProperties(value);
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
        var self = this;
        var behaviors = this.behaviors;
        // Check if behavior has tick and/or tock and remove the behavior from the appropriate array.
        Object.keys(behaviors).forEach(function (behaviorType) {
          if (!behavior[behaviorType]) { return; }
          var behaviorArr = self.behaviors[behaviorType];
          var index = behaviorArr.indexOf(behavior);
          if (index !== -1) {
            behaviorArr.splice(index, 1);
          }
        });
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
        var renderer = this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: shouldAntiAlias(this),
          alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.sortObjects = false;
        this.effect = new THREE.VREffect(renderer);
        this.effect.autoSubmitFrame = false;
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
              sceneEl.clock = new THREE.Clock();
              sceneEl.render();
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
        TWEEN.update();

        // Components.
        this.behaviors.tick.forEach(function (component) {
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
     * Behavior-updater meant to be called after scene render for post processing purposes.
     * Abstracted to a different function to facilitate unit testing (`scene.tock()`) without
     * needing to render.
     */
    tock: {
      value: function (time, timeDelta) {
        var systems = this.systems;

        // Components.
        this.behaviors.tock.forEach(function (component) {
          if (!component.el.isPlaying) { return; }
          component.tock(time, timeDelta);
        });
        // Systems.
        Object.keys(systems).forEach(function (key) {
          if (!systems[key].tock) { return; }
          systems[key].tock(time, timeDelta);
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
      value: function () {
        var effect = this.effect;
        var delta = this.clock.getDelta() * 1000;
        this.time = this.clock.elapsedTime * 1000;

        if (this.isPlaying) { this.tick(this.time, delta); }

        this.animationFrameID = effect.requestAnimationFrame(this.render);
        effect.render(this.object3D, this.camera, this.renderTarget);

        if (this.isPlaying) { this.tock(this.time, delta); }

        this.effect.submitFrame();
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

/**
 * Determines if renderer anti-aliasing should be enabled.
 * Enabled by default if has native WebVR or is desktop.
 *
 * @returns {bool}
 */
function shouldAntiAlias (sceneEl) {
  // Explicitly set.
  if (sceneEl.getAttribute('antialias') !== null) {
    return sceneEl.getAttribute('antialias') === 'true';
  }

  // Default not AA for mobile.
  return !sceneEl.isMobile;
}
module.exports.shouldAntiAlias = shouldAntiAlias;  // For testing.
