var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

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
    spectator: {default: false},
    zoom: {default: 1, min: 0}
  },

  /**
   * Initialize three.js camera and add it to the entity.
   * Add reference from scene to this entity as the camera.
   */
  init: function () {
    var camera;
    var el = this.el;

    // Create camera.
    camera = this.camera = new THREE.PerspectiveCamera();
    el.setObject3D('camera', camera);
  },

  /**
   * Update three.js camera.
   */
  update: function (oldData) {
    var data = this.data;
    var camera = this.camera;

    // Update properties.
    camera.aspect = data.aspect || (window.innerWidth / window.innerHeight);
    camera.far = data.far;
    camera.fov = data.fov;
    camera.near = data.near;
    camera.zoom = data.zoom;
    camera.updateProjectionMatrix();

    this.updateActiveCamera(oldData);
    this.updateSpectatorCamera(oldData);
  },

  updateActiveCamera: function (oldData) {
    var data = this.data;
    var el = this.el;
    var system = this.system;
    // Active property did not change.
    if (oldData && oldData.active === data.active || data.spectator) { return; }

    // If `active` property changes, or first update, handle active camera with system.
    if (data.active && system.activeCameraEl !== el) {
      // Camera enabled. Set camera to this camera.
      system.setActiveCamera(el);
    } else if (!data.active && system.activeCameraEl === el) {
      // Camera disabled. Set camera to another camera.
      system.disableActiveCamera();
    }
  },

  updateSpectatorCamera: function (oldData) {
    var data = this.data;
    var el = this.el;
    var system = this.system;
    // spectator property did not change.
    if (oldData && oldData.spectator === data.spectator) { return; }

    // If `spectator` property changes, or first update, handle spectator camera with system.
    if (data.spectator && system.spectatorCameraEl !== el) {
      // Camera enabled. Set camera to this camera.
      system.setSpectatorCamera(el);
    } else if (!data.spectator && system.spectatorCameraEl === el) {
      // Camera disabled. Set camera to another camera.
      system.disableSpectatorCamera();
    }
  },

  /**
   * Remove camera on remove (callback).
   */
  remove: function () {
    this.el.removeObject3D('camera');
  }
});
