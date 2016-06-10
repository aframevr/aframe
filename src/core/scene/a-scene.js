/* global Promise */
var initMetaTags = require('./metaTags').inject;
var initWakelock = require('./wakelock');
var re = require('../a-register-element');
var systems = require('../system').systems;
var THREE = require('../../lib/three');
var TWEEN = require('tween.js');
var utils = require('../../utils/');
// Require after.
var AEntity = require('../a-entity');
var ANode = require('../a-node');
var initPostMessageAPI = require('./postMessage');

var registerElement = re.registerElement;
var isIOS = utils.isIOS();
var isMobile = utils.isMobile();

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
 * @member {object} stereoRenderer
 * @member {object} systems - Registered instantiated systems.
 * @member {number} time
 */
module.exports = registerElement('a-scene', {
  prototype: Object.create(AEntity.prototype, {
    defaultComponents: {
      value: {
        'canvas': '',
        'keyboard-shortcuts': '',
        'vr-mode-ui': ''
      }
    },

    createdCallback: {
      value: function () {
        this.isMobile = isMobile;
        this.isIOS = isIOS;
        this.isScene = true;
        this.object3D = new THREE.Scene();
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
        this.setupSystems();
        this.addEventListener('render-target-loaded', function () {
          this.setupRenderer();
          this.resize();
        });
        initPostMessageAPI(this);
      },
      writable: true
    },

    attachedCallback: {
      value: function () {
        var resize = this.resize.bind(this);
        initMetaTags(this);
        initWakelock(this);

        window.addEventListener('load', resize);
        window.addEventListener('resize', resize);
        this.play();
      },
      writable: window.debug
    },

    setupSystems: {
      value: function () {
        var systemsKeys = Object.keys(systems);
        systemsKeys.forEach(this.initSystem.bind(this));
      }
    },

    initSystem: {
      value: function (name) {
        var system;
        if (this.systems[name]) { return; }
        system = this.systems[name] = new systems[name]();
        system.sceneEl = this;
        system.init();
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
        var behaviors = this.behaviors;
        if (behaviors.indexOf(behavior) !== -1) { return; }
        behaviors.push(behavior);
      }
    },

    /**
     * Generally must be triggered on user action for requesting fullscreen.
     */
    enterVR: {
      value: function (event) {
        var self = this;
        return this.effect.requestPresent().then(enterVRSuccess, enterVRFailure);
        function enterVRSuccess () {
          self.addState('vr-mode');
          self.emit('enter-vr', event);
          // Lock to landscape orientation on mobile.
          if (self.isMobile && window.screen.orientation) {
            window.screen.orientation.lock('landscape');
          }
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

    exitVR: {
      value: function () {
        var self = this;
        return this.effect.exitPresent().then(exitVRSuccess, exitVRFailure);
        function exitVRSuccess () {
          self.removeState('vr-mode');
          // Lock to landscape orientation on mobile.
          if (self.isMobile && window.screen.orientation) {
            window.screen.orientation.unlock();
          }
          self.resize();
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
        var size;

        // Possible camera or canvas not injected yet.
        if (!camera || !canvas) { return; }

        // Update canvas if canvas was provided by A-Frame.
        if (!isMobile && canvas.dataset.aframeDefault) {
          canvas.style.width = '100%';
          canvas.style.height = '100%';
        }

        // Update camera.
        size = getCanvasSize(canvas, isMobile);
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();

        // Notify renderer of size change.
        this.renderer.setSize(size.width, size.height, true);
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
          if (this.renderStarted) { return; }

          AEntity.prototype.play.call(this);
          this.resize();

          // Kick off render loop.
          if (this.renderer) {
            if (window.performance) {
              window.performance.mark('render-started');
            }
            this.render(0);
            this.renderStarted = true;
            this.emit('renderstart');
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
        var camera = this.camera;
        var timeDelta = time - this.time;

        if (this.isPlaying) {
          this.tick(time, timeDelta);
        }
        this.effect.render(this.object3D, camera);

        this.time = time;
        this.animationFrameID = window.requestAnimationFrame(this.render.bind(this));
      },
      writable: window.debug
    }
  })
});

function getCanvasSize (canvas) {
  if (isMobile) {
    return {
      height: window.innerHeight,
      width: window.innerWidth
    };
  }
  return {
    height: canvas.offsetHeight,
    width: canvas.offsetWidth
  };
}
