var bind = require('../utils/bind');
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
    // Wait for all entities to fully load before checking for existence of camera.
    // Since entities wait for <a-assets> to load, any cameras attaching to the scene
    // will do so asynchronously.
    this.sceneEl.addEventListener('loaded', bind(this.setupDefaultCamera, this));
  },

  /**
   * Create a default camera if user has not added one during the initial scene traversal.
   *
   * Default camera offset height is at average eye level (~1.6m).
   */
  setupDefaultCamera: function () {
    var sceneEl = this.sceneEl;
    var defaultCameraEl;

    // Camera already defined.
    if (sceneEl.camera) {
      sceneEl.emit('camera-ready', {cameraEl: sceneEl.camera.el});
      return;
    }

    // Set up default camera.
    defaultCameraEl = document.createElement('a-entity');
    defaultCameraEl.setAttribute('position', '0 0 0');
    defaultCameraEl.setAttribute(DEFAULT_CAMERA_ATTR, '');
    defaultCameraEl.setAttribute('camera', {active: true, userHeight: constants.DEFAULT_CAMERA_HEIGHT});
    defaultCameraEl.setAttribute('wasd-controls', '');
    defaultCameraEl.setAttribute('look-controls', '');
    defaultCameraEl.setAttribute(constants.AFRAME_INJECTED, '');
    sceneEl.appendChild(defaultCameraEl);
    sceneEl.addEventListener('enter-vr', this.removeDefaultOffset);
    sceneEl.addEventListener('exit-vr', this.addDefaultOffset);
    sceneEl.emit('camera-ready', {cameraEl: defaultCameraEl});
  },

  /**
   * Set a different active camera.
   * When we choose a (sort of) random scene camera as the replacement, set its `active` to
   * true. The camera component will call `setActiveCamera` and handle passing the torch to
   * the new camera.
   */
  disableActiveCamera: function () {
    var cameraEls = this.sceneEl.querySelectorAll('[camera]');
    var newActiveCameraEl = cameraEls[cameraEls.length - 1];
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
      if (newCameraEl === cameraEl) { continue; }
      cameraEl.setAttribute('camera', 'active', false);
      cameraEl.pause();
    }
    sceneEl.emit('camera-set-active', {cameraEl: newCameraEl});
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
