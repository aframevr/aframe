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
    var cameraWrapperEl;
    var defaultCameraEl;

    // setTimeout in case the camera is being set dynamically with a setAttribute.
    setTimeout(function checkForCamera () {
      var cameraEl = sceneEl.querySelector('[camera]');

      if (cameraEl && cameraEl.isEntity) {
        sceneEl.emit('camera-ready', {cameraEl: cameraEl});
        return;
      }

      // DOM calls to create camera.
      cameraWrapperEl = document.createElement('a-entity');
      cameraWrapperEl.setAttribute('position', {x: 0, y: 1.8, z: 4});
      cameraWrapperEl.setAttribute(DEFAULT_CAMERA_ATTR, '');
      defaultCameraEl = document.createElement('a-entity');
      defaultCameraEl.setAttribute('camera', {'active': true});
      defaultCameraEl.setAttribute('wasd-controls');
      defaultCameraEl.setAttribute('look-controls');
      cameraWrapperEl.appendChild(defaultCameraEl);
      sceneEl.appendChild(cameraWrapperEl);
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
    var sceneEl = this.sceneEl;
    var sceneCameras = sceneEl.querySelectorAll('[camera]');
    var newActiveCameraEl = sceneCameras[sceneCameras.length - 1];
    newActiveCameraEl.setAttribute('camera', 'active', true);
  },

  /**
   * Set active camera to be used by renderer.
   * Removes the default camera (if present).
   * Disables all other cameras in the scene.
   *
   * @param {Element} newCameraEl - Entity with camera component.
   * @param {object} newCamera - three.js Camera object.
   */
  setActiveCamera: function (newCameraEl, newCamera) {
    var cameraEl;
    var i;
    var sceneEl = this.sceneEl;
    var sceneCameraEls = sceneEl.querySelectorAll('[camera]');

    // Grab the default camera.
    var defaultCameraWrapper = sceneEl.querySelector('[' + DEFAULT_CAMERA_ATTR + ']');
    var defaultCameraEl = defaultCameraWrapper &&
                          defaultCameraWrapper.querySelector('[camera]');
    // Remove default camera if new camera is not the default camera.
    if (newCameraEl !== defaultCameraEl) { removeDefaultCamera(sceneEl); }

    // Make new camera active.
    this.activeCameraEl = newCameraEl;
    if (sceneEl.isPlaying) { newCameraEl.play(); }
    newCameraEl.setAttribute('camera', 'active', true);
    sceneEl.camera = newCamera;
    sceneEl.emit('camera-set-active', {cameraEl: newCameraEl});

    // Disable other cameras.
    for (i = 0; i < sceneCameraEls.length; i++) {
      cameraEl = sceneCameraEls[i];
      if (newCameraEl === cameraEl) { continue; }
      cameraEl.setAttribute('camera', 'active', false);
      cameraEl.pause();
    }
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
