var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var utils = require('../utils/');
var bind = utils.bind;

var checkHasPositionalTracking = utils.device.checkHasPositionalTracking;

/**
 * Camera component.
 * Pairs along with camera system to handle tracking the active camera.
 */
module.exports.Component = registerComponent('camera', {
  schema: {
    active: {default: true},
    far: {default: 10000},
    fov: {default: 80, min: 0},
    near: {default: 0.005, min: 0},
    userHeight: {default: 0, min: 0},
    zoom: {default: 1, min: 0}
  },

  /**
   * Initialize three.js camera and add it to the entity.
   * Add reference from scene to this entity as the camera.
   */
  init: function () {
    var camera;
    var el = this.el;
    var sceneEl = el.sceneEl;

    this.savedPose = null;

    // Create camera.
    camera = this.camera = new THREE.PerspectiveCamera();
    el.setObject3D('camera', camera);

    // Add listeners to save and restore camera pose if headset is present.
    this.onEnterVR = bind(this.onEnterVR, this);
    this.onExitVR = bind(this.onExitVR, this);
    sceneEl.addEventListener('enter-vr', this.onEnterVR);
    sceneEl.addEventListener('exit-vr', this.onExitVR);
  },

  /**
   * Update three.js camera.
   */
  update: function (oldData) {
    var el = this.el;
    var data = this.data;
    var camera = this.camera;
    var system = this.system;

    // Update height offset.
    this.addHeightOffset(oldData.userHeight);

    // Update properties.
    camera.aspect = data.aspect || (window.innerWidth / window.innerHeight);
    camera.far = data.far;
    camera.fov = data.fov;
    camera.near = data.near;
    camera.zoom = data.zoom;
    camera.updateProjectionMatrix();

    // Active property did not change.
    if (oldData && oldData.active === data.active) { return; }

    // If `active` property changes, or first update, handle active camera with system.
    if (data.active && system.activeCameraEl !== el) {
      // Camera enabled. Set camera to this camera.
      system.setActiveCamera(el);
    } else if (!data.active && system.activeCameraEl === el) {
      // Camera disabled. Set camera to another camera.
      system.disableActiveCamera();
    }
  },

  /**
   * Remove camera on remove (callback).
   */
  remove: function () {
    var sceneEl = this.el.sceneEl;
    this.el.removeObject3D('camera');
    sceneEl.removeEventListener('enter-vr', this.onEnterVR);
    sceneEl.removeEventListener('exit-vr', this.onExitVR);
  },

  /**
   * Save pose and remove the offset.
   */
  onEnterVR: function () {
    this.saveCameraPose();
    this.removeHeightOffset();
  },

  /**
   * Restore the pose. Do not need to re-add the offset because it was saved on entering VR.
   */
  onExitVR: function () {
    this.restoreCameraPose();
  },

  /**
   * Offsets the position of the camera to set a human scale perspective
   * This offset is not necessary when using a headset because the SDK
   * will return the real user's head height and position.
   */
  addHeightOffset: function (oldOffset) {
    var el = this.el;
    var currentPosition;
    var userHeightOffset = this.data.userHeight;

    oldOffset = oldOffset || 0;
    currentPosition = el.getAttribute('position') || {x: 0, y: 0, z: 0};
    el.setAttribute('position', {
      x: currentPosition.x,
      y: currentPosition.y - oldOffset + userHeightOffset,
      z: currentPosition.z
    });
  },

  /**
   * Remove the height offset (called when entering VR) since WebVR API gives absolute
   * position.
   */
  removeHeightOffset: function () {
    var currentPosition;
    var el = this.el;
    var hasPositionalTracking;
    var userHeightOffset = this.data.userHeight;

    // Remove the offset if there is positional tracking when entering VR.
    // Necessary for fullscreen mode with no headset.
    // Checking this.hasPositionalTracking to make the value injectable for unit tests.
    hasPositionalTracking = this.hasPositionalTracking || checkHasPositionalTracking();
    if (!userHeightOffset || !hasPositionalTracking) { return; }

    currentPosition = el.getAttribute('position') || {x: 0, y: 0, z: 0};
    el.setAttribute('position', {
      x: currentPosition.x,
      y: currentPosition.y - userHeightOffset,
      z: currentPosition.z
    });
  },

  /**
   * Save camera pose before entering VR to restore later if exiting.
   */
  saveCameraPose: function () {
    var el = this.el;
    var hasPositionalTracking = this.hasPositionalTracking || checkHasPositionalTracking();

    if (this.savedPose || !hasPositionalTracking) { return; }

    this.savedPose = {
      position: el.getAttribute('position'),
      rotation: el.getAttribute('rotation')
    };
  },

  /**
   * Reset camera pose to before entering VR.
   */
  restoreCameraPose: function () {
    var el = this.el;
    var savedPose = this.savedPose;
    var hasPositionalTracking = this.hasPositionalTracking || checkHasPositionalTracking();

    if (!savedPose || !hasPositionalTracking) { return; }

    // Reset camera orientation.
    el.setAttribute('position', savedPose.position);
    el.setAttribute('rotation', savedPose.rotation);
    this.savedPose = null;
  }
});
