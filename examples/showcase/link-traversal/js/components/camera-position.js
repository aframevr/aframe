/* global AFRAME */
AFRAME.registerComponent('camera-position', {
  schema: {
    mobile: {type: 'vec3', default: '0 1.6 3'},
    desktop: {type: 'vec3', default: '0 1.6 2'}
  },
  init: function () {
    this.onCameraSetActive = this.onCameraSetActive.bind(this);
    this.resetCamera = this.resetCamera.bind(this);
    if (this.el.camera) { this.onCameraSetActive(); }
    this.el.addEventListener('camera-set-active', this.onCameraSetActive);
    this.el.addEventListener('exit-vr', this.onCameraSetActive);
    this.el.addEventListener('enter-vr', this.resetCamera);
  },

  onCameraSetActive: function () {
    let cameraEl = this.el.camera.el;
    let data = this.data;
    let isMobile = AFRAME.utils.device.isMobile();
    let position = isMobile ? data.mobile : data.desktop;
    let savedPose = cameraEl.components.camera.savedPose;
    if (savedPose) { savedPose.position.z = position.z; }
    this.el.camera.el.setAttribute('position', position);
  },

  resetCamera: function () {
    let cameraEl = this.el.camera.el;
    let position = cameraEl.getAttribute('position');
    cameraEl.setAttribute('position', {
      x: position.x,
      y: position.y,
      z: 0
    });
  }
});
