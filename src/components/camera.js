var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var utils = require('../utils/');

var checkHeadsetConnected = utils.checkHeadsetConnected;

/**
 * Camera component.
 * Pairs along with camera system to handle tracking the active camera.
 */
module.exports.Component = registerComponent('camera', {
  schema: {
    active: { default: true },
    far: { default: 10000 },
    fov: { default: 80, min: 0 },
    near: { default: 0.005, min: 0 },
    userHeight: { default: 0, min: 0 },
    zoom: { default: 1, min: 0 }
  },

  /**
   * Initialize three.js camera and add it to the entity.
   * Add reference from scene to this entity as the camera.
   */
  init: function () {
    var camera = this.camera = new THREE.PerspectiveCamera();
    var sceneEl = this.el.sceneEl;
    this.el.setObject3D('camera', camera);
    this.bindMethods();
    sceneEl.addEventListener('enter-vr', this.removeHeightOffset);
    sceneEl.addEventListener('enter-vr', this.saveCameraPose);
    sceneEl.addEventListener('exit-vr', this.restoreCameraPose);
    sceneEl.addEventListener('exit-vr', this.addHeightOffset);
  },

  bindMethods: function () {
    this.addHeightOffset = this.addHeightOffset.bind(this);
    this.removeHeightOffset = this.removeHeightOffset.bind(this);
    this.updateHeightOffset = this.updateHeightOffset.bind(this);
    this.saveCameraPose = this.saveCameraPose.bind(this);
    this.restoreCameraPose = this.restoreCameraPose.bind(this);
  },

  /**
   * Offsets the position of the camera to set a human scale perspective
   * This offset is not necessary when using a headset because the SDK
   * will return the real user's head height and position.
   */
  addHeightOffset: function () {
    var el = this.el;
    var currentPosition;
    // Only applies if there's a default camera with no applied offset.
    if (this.userHeightOffset) { return; }
    currentPosition = el.getComputedAttribute('position') || {x: 0, y: 0, z: 0};
    this.userHeightOffset = this.data.userHeight;
    el.setAttribute('position', {
      x: currentPosition.x,
      y: currentPosition.y + this.userHeightOffset,
      z: currentPosition.z
    });
  },

  /**
   * Remove the height offset (called when entering VR) since WebVR API gives absolute
   * position.
   * Does not apply for mobile.
   */
  removeHeightOffset: function () {
    var currentPosition;
    var el = this.el;
    var headsetConnected;
    var sceneEl = el.sceneEl;
    var userHeightOffset = this.userHeightOffset;

    // Checking this.headsetConnected to make the value injectable for unit tests.
    headsetConnected = this.headsetConnected || checkHeadsetConnected();

    // If there's not a headset connected we keep the offset.
    // Necessary for fullscreen mode with no headset.
    if (sceneEl.isMobile || !userHeightOffset || !headsetConnected) { return; }

    this.userHeightOffset = undefined;
    currentPosition = el.getAttribute('position') || {x: 0, y: 0, z: 0};
    el.setAttribute('position', {
      x: currentPosition.x,
      y: currentPosition.y - userHeightOffset,
      z: currentPosition.z
    });
  },

  /**
   * Enables updating camera.userHeight
   */
  updateHeightOffset: function () {
    var currentPosition;
    var headsetConnected;
    var el = this.el;
    var oldHeightOffset = this.userHeightOffset;

    headsetConnected = this.headsetConnected || checkHeadsetConnected();

    // Do not update camera.userHeight if headset is connected
    if (headsetConnected) { return; }

    this.userHeightOffset = this.data.userHeight;

    currentPosition = el.getComputedAttribute('position') || {x: 0, y: 0, z: 0};
    el.setAttribute('position', {
      x: currentPosition.x,
      y: currentPosition.y - oldHeightOffset + this.userHeightOffset,
      z: currentPosition.z
    });
  },

  saveCameraPose: function () {
    var el = this.el;
    var headsetConnected = this.headsetConnected || checkHeadsetConnected();
    if (this.savedPose || !headsetConnected) { return; }
    this.savedPose = {
      position: el.getAttribute('position'),
      rotation: el.getAttribute('rotation')
    };
  },

  restoreCameraPose: function () {
    var el = this.el;
    var savedPose = this.savedPose;
    if (!savedPose) { return; }
    // Resets camera orientation
    el.setAttribute('position', savedPose.position);
    el.setAttribute('rotation', savedPose.rotation);
    this.savedPose = undefined;
  },

  /**
   * Remove camera on remove (callback).
   */
  remove: function () {
    var sceneEl = this.el.sceneEl;
    this.el.removeObject3D('camera');
    sceneEl.removeEventListener('enter-vr', this.removeHeightOffset);
    sceneEl.removeEventListener('enter-vr', this.saveCameraPose);
    sceneEl.removeEventListener('exit-vr', this.restoreCameraPose);
    sceneEl.removeEventListener('exit-vr', this.addHeightOffset);
  },

  /**
   * Update three.js camera.
   */
  update: function (oldData) {
    var el = this.el;
    var data = this.data;
    var camera = this.camera;
    var system = this.system;
    if (!oldData || oldData.userHeight !== data.userHeight) {
      this.userHeightOffset = oldData.userHeight || 0;
      this.updateHeightOffset();
    }

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
    if (data.active && system.activeCameraEl !== this.el) {
      // Camera enabled. Set camera to this camera.
      system.setActiveCamera(el);
    } else if (!data.active && system.activeCameraEl === this.el) {
      // Camera disabled. Set camera to another camera.
      system.disableActiveCamera();
    }
  }
});
