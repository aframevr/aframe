var registerSystem = require('../core/system').registerSystem;

var DEFAULT_CAMERA_ATTR = 'data-aframe-default-camera';
var DEFAULT_USER_HEIGHT = 1.6;

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
   * Create a default camera if user has not added one during the initial scene traversal.
   *
   * Default camera offset height is at average eye level (~1.6m).
   */
  setupDefaultCamera: function () {
    var self = this;
    var sceneEl = this.sceneEl;
    var defaultCameraEl;

    // Wait for all entities to fully load before checking for existence of camera.
    // Since entities wait for <a-assets> to load, any cameras attaching to the scene
    // will do so asynchronously.
    sceneEl.addEventListener('loaded', function checkForCamera () {
      var currentCamera = sceneEl.camera;
      if (currentCamera) {
        sceneEl.emit('camera-ready', {cameraEl: currentCamera.el});
        return;
      }
      defaultCameraEl = document.createElement('a-entity');
      defaultCameraEl.setAttribute('position', '0 0 0');
      defaultCameraEl.setAttribute(DEFAULT_CAMERA_ATTR, '');
      defaultCameraEl.setAttribute('camera', {active: true, userHeight: DEFAULT_USER_HEIGHT});
      defaultCameraEl.setAttribute('wasd-controls', '');
      defaultCameraEl.setAttribute('look-controls', '');
      sceneEl.appendChild(defaultCameraEl);
      sceneEl.addEventListener('enter-vr', self.removeDefaultOffset);
      sceneEl.addEventListener('exit-vr', self.addDefaultOffset);
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
  var defaultCamera;
  var camera = sceneEl.camera;
  if (!camera) { return; }

  // Remove default camera if present.
  defaultCamera = sceneEl.querySelector('[' + DEFAULT_CAMERA_ATTR + ']');
  if (!defaultCamera) { return; }
  sceneEl.removeChild(defaultCamera);
}
