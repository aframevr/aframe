/* global AFRAME */
AFRAME.registerComponent('camera-position', {
  schema: {
    mobile: {type: 'vec3', default: '0 1.6 3'},
    desktop: {type: 'vec3', default: '0 1.6 3'}
  },
  init: function () {
    this.onCameraSetActive = this.onCameraSetActive.bind(this);
    this.resetCamera = this.resetCamera.bind(this);
    this.el.addEventListener('camera-set-active', this.onCameraSetActive);
    this.el.addEventListener('exit-vr', this.onCameraSetActive);
    this.el.addEventListener('enter-vr', this.resetCamera);
  },

  onCameraSetActive: function () {
    var cameraEl = this.el.camera.el;
    var data = this.data;
    var isMobile = AFRAME.utils.device.isMobile();
    var position = isMobile ? data.mobile : data.desktop;
    var savedPose = cameraEl.components.camera.savedPose;
    if (savedPose) { savedPose.position.z = position.z; }
    this.el.camera.el.setAttribute('position', position);
  },

  resetCamera: function () {
    var cameraEl = this.el.camera.el;
    var position = cameraEl.getAttribute('position');
    cameraEl.setAttribute('position', {
      x: position.x,
      y: position.y,
      z: 0
    });
  }
});
