/* global Promise */
var initFullscreen = require('./fullscreen');
var initMetaTags = require('./metaTags');
var initWakelock = require('./wakelock');
var re = require('../a-register-element');
var THREE = require('../../lib/three');
var TWEEN = require('tween.js');
var utils = require('../../utils/');
// Require after.
var AEntity = require('../a-entity');
var ANode = require('../a-node');

var DEFAULT_CAMERA_ATTR = 'data-aframe-default-camera';
var DEFAULT_LIGHT_ATTR = 'data-aframe-default-light';
var registerElement = re.registerElement;
var isMobile = utils.isMobile();

/**
 * Scene element, holds all entities.
 *
 * @member {number} animationFrameID
 * @member {array} behaviors - Component instances that have registered themselves to be
           updated on every tick.
 * @member {object} canvas
 * @member {bool} isScene - Differentiates as scene entity as opposed to other entites.
 * @member {bool} isMobile - Whether browser is mobile (via UA detection).
 * @member {object} object3D - Root three.js Scene object.
 * @member {object} monoRenderer
 * @member {object} renderer
 * @member {bool} renderStarted
 * @member {object} stereoRenderer
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
        this.defaultLightsEnabled = true;
        this.isMobile = isMobile;
        this.isScene = true;
        this.object3D = new THREE.Scene();
        this.time = 0;
        this.init();
      }
    },

    init: {
      value: function () {
        this.behaviors = [];
        this.hasLoaded = false;
        this.materials = {};
        this.originalHTML = this.innerHTML;
        this.paused = true;

        this.setupDefaultLights();
        this.setupDefaultCamera();
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
     * Sets a camera to be used by the renderer
     * It alse removes the default one if any and disables any other camera
     * in the scene
     *
     * @param {object} el - Object holding an entity with a camera component or THREE camera.
     */
    setActiveCamera: {
      value: function (newCamera) {
        var defaultCameraWrapper = document.querySelector('[' + DEFAULT_CAMERA_ATTR + ']');
        var defaultCameraEl = defaultCameraWrapper &&
                              defaultCameraWrapper.querySelector('[camera]');
        if (newCamera instanceof AEntity) {
          newCamera.setAttribute('camera', 'active', true);
          if (newCamera !== defaultCameraEl) { this.removeDefaultCamera(); }
          return;
        }
        this.camera = newCamera;
        this.updateCameras();
      }
    },

    /**
     * Enables active camera and disables the rest
     * @type object - activeCamera - The camera used by the renderer
     */
    updateCameras: {
      value: function () {
        var activeCamera = this.camera;
        var activeCameraEl = activeCamera && activeCamera.el;
        var cameraEl;
        var sceneCameras = this.querySelectorAll('[camera]');
        var i;
        if (!activeCamera) {
          activeCameraEl = sceneCameras[sceneCameras.length - 1];
          activeCameraEl.setAttribute('camera', 'active', true);
          return;
        }

        for (i = 0; i < sceneCameras.length; ++i) {
          cameraEl = sceneCameras[i];

          if (activeCameraEl === cameraEl) {
            if (!this.paused) { activeCameraEl.play(); }
            continue;
          }
          cameraEl.setAttribute('camera', 'active', false);
          cameraEl.pause();
        }
      }
    },

    removeDefaultCamera: {
      value: function () {
        var cameraEl = this.camera && this.camera.el;
        if (!cameraEl) { return; }
        // Removes default camera if any
        var defaultCamera = document.querySelector('[' + DEFAULT_CAMERA_ATTR + ']');
        var defaultCameraEl = defaultCamera && defaultCamera.querySelector('[camera]');
        // Remove default camera if any
        if (defaultCameraEl && defaultCameraEl !== cameraEl) {
          this.removeChild(defaultCamera);
        }
      }
    },

    /**
     * Notify scene that light has been added and to remove the default.
     *
     * @param {object} el - element holding the light component.
     */
    registerLight: {
      value: function (el) {
        var defaultLights;
        if (this.defaultLightsEnabled && !el.hasAttribute(DEFAULT_LIGHT_ATTR)) {
          // User added a light, remove default lights through DOM.
          defaultLights = document.querySelectorAll('[' + DEFAULT_LIGHT_ATTR + ']');
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

    resize: {
      value: function () {
        var camera = this.camera;
        var canvas = this.canvas;
        var size;

        // Possible camera or canvas not injected yet.
        if (!camera || !canvas) { return; }

        // Update canvas.
        if (!isMobile) {
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

    /**
     * Creates a default camera if user has not added one during the initial scene traversal.
     *
     * Default camera height is at human level (~1.8m) and back such that
     * entities at the origin (0, 0, 0) are well-centered.
     */
    setupDefaultCamera: {
      value: function () {
        var self = this;
        var cameraWrapperEl;
        var defaultCamera;

        // setTimeout in case the camera is being set dynamically with a setAttribute.
        setTimeout(function checkForCamera () {
          var sceneCameras = self.querySelectorAll('[camera]');
          if (sceneCameras.length !== 0) { return; }

          // DOM calls to create camera.
          cameraWrapperEl = document.createElement('a-entity');
          cameraWrapperEl.setAttribute('position', {x: 0, y: 1.8, z: 4});
          cameraWrapperEl.setAttribute(DEFAULT_CAMERA_ATTR, '');
          defaultCamera = document.createElement('a-entity');
          defaultCamera.setAttribute('camera', {'active': true});
          defaultCamera.setAttribute('wasd-controls');
          defaultCamera.setAttribute('look-controls');
          cameraWrapperEl.appendChild(defaultCamera);
          self.appendChild(cameraWrapperEl);
        });
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

    setupRenderer: {
      value: function () {
        var canvas = this.canvas;
        // Set at startup. To enable/disable antialias
        // at runttime we would have to recreate the whole context
        var antialias = this.getAttribute('antialias') === 'true';
        var renderer = this.renderer = this.monoRenderer =
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
     * Reloads the scene to the original DOM content
     * @type {bool} - paused - It reloads the scene with all the
     * dynamic behavior paused: dynamic components and animations
     */
    reload: {
      value: function (paused) {
        var self = this;
        if (paused) { this.pause(); }
        this.innerHTML = this.originalHTML;
        this.init();
        ANode.prototype.load.call(this, play);
        function play () {
          if (self.paused) { return; }
          AEntity.prototype.play.call(self);
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

        if (!this.paused) {
          TWEEN.update(time);
          this.behaviors.forEach(function (component) {
            if (component.el.paused) { return; }
            component.tick(time, timeDelta);
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
