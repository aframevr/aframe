/* global Promise */
var initFullscreen = require('./fullscreen');
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
 * @member {object} monoRenderer
 * @member {object} renderer
 * @member {bool} renderStarted
 * @member {object} stereoRenderer
 * @member {object} systems - Registered instantiated systems.
 * @member {number} time
 */
var AScene = module.exports = registerElement('a-scene', {
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
        this.isPlaying = true;
        this.originalHTML = this.innerHTML;
        this.setupSystems();
        this.addEventListener('render-target-loaded', function () {
          this.setupRenderer();
          this.resize();
        });
      },
      writable: true
    },

    attachedCallback: {
      value: function () {
        initFullscreen(this);
        initMetaTags(this);
        initWakelock(this);

        window.addEventListener('load', this.resize.bind(this));
        window.addEventListener('resize', this.resize.bind(this), false);
        this.addEventListener('fullscreen-exit', this.exitVR.bind(this));
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
        this.setStereoRenderer();
        if (isMobile) {
          setFullscreen(this.canvas);
        } else {
          this.stereoRenderer.setFullScreen(true);
        }
        this.addState('vr-mode');
        this.emit('enter-vr', event);
      }
    },

    exitVR: {
      value: function () {
        this.setMonoRenderer();
        this.removeState('vr-mode');
        this.emit('exit-vr', { target: this });
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

        // Update canvas.
        if (!isMobile && canvas.dataset.aframeProvided) {
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

    /**
     * Sets renderer to mono (one eye).
     */
    setMonoRenderer: {
      value: function () {
        this.renderer = this.monoRenderer;
        this.resize();
      }
    },

    /**
     * Sets renderer to stereo (two eyes).
     */
    setStereoRenderer: {
      value: function () {
        this.renderer = this.stereoRenderer;
        this.resize();
      }
    },

    setupRenderer: {
      value: function () {
        var canvas = this.canvas;
        // Set at startup. To enable/disable antialias
        // at runttime we would have to recreate the whole context
        var antialias = this.getAttribute('antialias') === 'true';
        var renderer = this.renderer = this.monoRenderer = new THREE.WebGLRenderer({
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
            this.render();
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
        var systems = this.systems;

        if (this.isPlaying) {
          TWEEN.update(time);
          this.behaviors.forEach(function (component) {
            if (!component.el.isPlaying) { return; }
            component.tick(time, timeDelta);
          });
          Object.keys(systems).forEach(function (key) {
            if (!systems[key].tick) { return; }
            systems[key].tick(time, timeDelta);
          });
        }

        this.renderer.render(this.object3D, camera);

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

/**
 * Manually handles fullscreen for non-VR mobile where the renderer' VR
 * display is not polyfilled.
 *
 * Desktop just works so use the renderer.setFullScreen in that case.
 */
function setFullscreen (canvas) {
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.mozRequestFullScreen) {
    canvas.mozRequestFullScreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  }
}
