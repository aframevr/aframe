var constants = require('../constants/');
var registerSystem = require('../core/system').registerSystem;

var DEFAULT_CAMERA_ATTR = 'data-aframe-default-camera';

/**
 * Camera system. Manages which camera is active among multiple cameras in scene.
 *
 * @member {object} activeCameraEl - Active camera entity.
 */
module.exports.System = registerSystem('camera', {
  init: function () {
    this.activeCameraEl = null;

    this.render = this.render.bind(this);
    this.unwrapRender = this.unwrapRender.bind(this);
    this.wrapRender = this.wrapRender.bind(this);

    this.initialCameraFound = false;
    this.numUserCameras = 0;
    this.numUserCamerasChecked = 0;
    this.setupInitialCamera();
  },

  /**
   * Setup initial camera, either searching for camera or
   * creating a default camera if user has not added one during the initial scene traversal.
   * We want sceneEl.camera to be ready, set, and initialized before the rest of the scene
   * loads.
   *
   * Default camera offset height is at average eye level (~1.6m).
   */
  setupInitialCamera: function () {
    var cameraEls;
    var i;
    var sceneEl = this.sceneEl;
    var self = this;

    // Camera already defined or the one defined it is an spectator one.
    if (sceneEl.camera && !sceneEl.camera.el.getAttribute('camera').spectator) {
      sceneEl.emit('cameraready', {cameraEl: sceneEl.camera.el});
      return;
    }

    // Search for initial user-defined camera.
    cameraEls = sceneEl.querySelectorAll('a-camera, [camera]');

    // No user cameras, create default one.
    if (!cameraEls.length) {
      this.createDefaultCamera();
      return;
    }

    this.numUserCameras = cameraEls.length;
    for (i = 0; i < cameraEls.length; i++) {
      cameraEls[i].addEventListener('object3dset', function (evt) {
        if (evt.detail.type !== 'camera') { return; }
        self.checkUserCamera(this);
      });

      // Load camera and wait for camera to initialize.
      if (cameraEls[i].isNode) {
        cameraEls[i].load();
      } else {
        cameraEls[i].addEventListener('nodeready', function () {
          this.load();
        });
      }
    }
  },

  /**
   * Check if a user-defined camera entity is appropriate to be initial camera.
   * (active + non-spectator).
   *
   * Keep track of the number of cameras we checked and whether we found one.
   */
  checkUserCamera: function (cameraEl) {
    var cameraData;
    var sceneEl = this.el.sceneEl;
    this.numUserCamerasChecked++;

    // Already found one.
    if (this.initialCameraFound) { return; }

    // Check if camera is appropriate for being the initial camera.
    cameraData = cameraEl.getAttribute('camera');
    if (!cameraData.active || cameraData.spectator) {
      // No user cameras eligible, create default camera.
      if (this.numUserCamerasChecked === this.numUserCameras) {
        this.createDefaultCamera();
      }
      return;
    }

    this.initialCameraFound = true;
    sceneEl.camera = cameraEl.getObject3D('camera');
    sceneEl.emit('cameraready', {cameraEl: cameraEl});
  },

  createDefaultCamera: function () {
    var defaultCameraEl;
    var sceneEl = this.sceneEl;

    // Set up default camera.
    defaultCameraEl = document.createElement('a-entity');
    defaultCameraEl.setAttribute('camera', {active: true});
    defaultCameraEl.setAttribute('position', {
      x: 0,
      y: constants.DEFAULT_CAMERA_HEIGHT,
      z: 0
    });
    defaultCameraEl.setAttribute('wasd-controls', '');
    defaultCameraEl.setAttribute('look-controls', '');
    defaultCameraEl.setAttribute(constants.AFRAME_INJECTED, '');

    defaultCameraEl.addEventListener('object3dset', function (evt) {
      if (evt.detail.type !== 'camera') { return; }
      sceneEl.camera = evt.detail.object;
      sceneEl.emit('cameraready', {cameraEl: defaultCameraEl});
    });

    sceneEl.appendChild(defaultCameraEl);
  },

  /**
   * Set a different active camera.
   * When we choose a (sort of) random scene camera as the replacement, set its `active` to
   * true. The camera component will call `setActiveCamera` and handle passing the torch to
   * the new camera.
   */
  disableActiveCamera: function () {
    var cameraEls;
    var newActiveCameraEl;
    cameraEls = this.sceneEl.querySelectorAll('[camera]');
    newActiveCameraEl = cameraEls[cameraEls.length - 1];
    newActiveCameraEl.setAttribute('camera', 'active', true);
  },

  /**
   * Set active camera to be used by renderer.
   * Removes the default camera (if present).
   * Disables all other cameras in the scene.
   *
   * @param {Element} newCameraEl - Entity with camera component.
   */
  setActiveCamera: function (newCameraEl) {
    var cameraEl;
    var cameraEls;
    var i;
    var newCamera;
    var previousCamera = this.activeCameraEl;
    var sceneEl = this.sceneEl;

    // Same camera.
    newCamera = newCameraEl.getObject3D('camera');
    if (!newCamera || newCameraEl === this.activeCameraEl) { return; }

    // Grab the default camera.
    var defaultCameraWrapper = sceneEl.querySelector('[' + DEFAULT_CAMERA_ATTR + ']');
    var defaultCameraEl = defaultCameraWrapper &&
                          defaultCameraWrapper.querySelector('[camera]');

    // Remove default camera if new camera is not the default camera.
    if (newCameraEl !== defaultCameraEl) { removeDefaultCamera(sceneEl); }

    // Make new camera active.
    this.activeCameraEl = newCameraEl;
    this.activeCameraEl.play();
    sceneEl.camera = newCamera;

    // Disable current camera
    if (previousCamera) {
      previousCamera.setAttribute('camera', 'active', false);
    }

    // Disable other cameras in the scene
    cameraEls = sceneEl.querySelectorAll('[camera]');
    for (i = 0; i < cameraEls.length; i++) {
      cameraEl = cameraEls[i];
      if (!cameraEl.isEntity || newCameraEl === cameraEl) { continue; }
      cameraEl.setAttribute('camera', 'active', false);
      cameraEl.pause();
    }
    sceneEl.emit('camera-set-active', {cameraEl: newCameraEl});
  },

  /**
   * Set spectator camera to render the scene on a 2D display.
   *
   * @param {Element} newCameraEl - Entity with camera component.
   */
  setSpectatorCamera: function (newCameraEl) {
    var newCamera;
    var previousCamera = this.spectatorCameraEl;
    var sceneEl = this.sceneEl;
    var spectatorCameraEl;

    // Same camera.
    newCamera = newCameraEl.getObject3D('camera');
    if (!newCamera || newCameraEl === this.spectatorCameraEl) { return; }

    // Disable current camera
    if (previousCamera) {
      previousCamera.setAttribute('camera', 'spectator', false);
    }

    spectatorCameraEl = this.spectatorCameraEl = newCameraEl;

    sceneEl.addEventListener('enter-vr', this.wrapRender);
    sceneEl.addEventListener('exit-vr', this.unwrapRender);

    spectatorCameraEl.setAttribute('camera', 'active', false);
    spectatorCameraEl.play();

    sceneEl.emit('camera-set-spectator', {cameraEl: newCameraEl});
  },

  /**
   * Disables current spectator camera.
   */
  disableSpectatorCamera: function () {
    this.spectatorCameraEl = undefined;
  },

  /**
   * Wrap the render method of the renderer to render
   * the spectator camera after vrDisplay.submitFrame.
   */
  wrapRender: function () {
    if (!this.spectatorCameraEl) { return; }
    this.originalRender = this.sceneEl.renderer.render;
    this.sceneEl.renderer.render = this.render;
  },

  unwrapRender: function () {
    if (!this.originalRender) { return; }
    this.sceneEl.renderer.render = this.originalRender;
    this.originalRender = undefined;
  },

  render: function (scene, camera) {
    var isVREnabled;
    var sceneEl = this.sceneEl;
    var spectatorCamera;

    isVREnabled = sceneEl.renderer.vr.enabled;
    this.originalRender.call(sceneEl.renderer, scene, camera);
    if (!this.spectatorCameraEl || sceneEl.isMobile || !isVREnabled) { return; }
    spectatorCamera = this.spectatorCameraEl.components.camera.camera;
    sceneEl.renderer.vr.enabled = false;
    this.originalRender.call(sceneEl.renderer, scene, spectatorCamera);
    sceneEl.renderer.vr.enabled = isVREnabled;
  }
});

/**
 * Remove injected default camera from scene, if present.
 *
 * @param {Element} sceneEl
 */
function removeDefaultCamera (sceneEl) {
  var defaultCamera;
  var camera = sceneEl.camera;
  if (!camera) { return; }

  // Remove default camera if present.
  defaultCamera = sceneEl.querySelector('[' + DEFAULT_CAMERA_ATTR + ']');
  if (!defaultCamera) { return; }
  sceneEl.removeChild(defaultCamera);
}
