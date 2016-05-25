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
    this.setupDefaultCamera();
  },

  /**
   * Creates a default camera if user has not added one during the initial scene traversal.
   *
   * Default camera height is at human level (~1.8m) and back such that
   * entities at the origin (0, 0, 0) are well-centered.
   */
  setupDefaultCamera: function () {
    var sceneEl = this.sceneEl;
    var defaultCameraEl;
    // setTimeout in case the camera is being set dynamically with a setAttribute.
    setTimeout(function checkForCamera () {
      var currentCamera = sceneEl.camera;
      if (currentCamera) {
        sceneEl.emit('camera-ready', { cameraEl: currentCamera.el });
        return;
      }

      defaultCameraEl = document.createElement('a-entity');
      defaultCameraEl.setAttribute('position', {x: 0, y: 1.8, z: 4});
      defaultCameraEl.setAttribute(DEFAULT_CAMERA_ATTR, '');
      defaultCameraEl.setAttribute('camera', {'active': true});
      defaultCameraEl.setAttribute('wasd-controls', '');
      defaultCameraEl.setAttribute('look-controls', '');
      sceneEl.appendChild(defaultCameraEl);
      sceneEl.emit('camera-ready', {cameraEl: defaultCameraEl});
    });
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
    var cameraEls = this.sceneEl.querySelectorAll('[camera]');
    var i;
    var sceneEl = this.sceneEl;
    var newCamera = newCameraEl.getObject3D('camera');
    var previousCamera = this.activeCameraEl;
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
  var defaultCameraWrapper;
  var camera = sceneEl.camera;
  if (!camera) { return; }

  // Remove default camera if present.
  defaultCameraWrapper = sceneEl.querySelector('[' + DEFAULT_CAMERA_ATTR + ']');
  if (!defaultCameraWrapper) { return; }
  sceneEl.removeChild(defaultCameraWrapper);
}
