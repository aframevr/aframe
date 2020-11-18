/* global AFRAME */
AFRAME.registerComponent('pinch-scale', {
  init: function () {
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);

    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this.onOrientationChange = this.onOrientationChange.bind(this);

    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mousedown', this.onMouseDown);

    document.addEventListener('touchend', this.onTouchEnd);
    document.addEventListener('touchmove', this.onTouchMove);

    window.addEventListener('orientationchange', this.onOrientationChange);
    if (AFRAME.utils.device.isLandscape()) {
      this.el.object3D.position.z += 1.5;
    }
  },

  onTouchMove: function (evt) {
    var dX;
    var dY;
    var distance;
    var oldDistance;
    var distanceDifference;

    if (evt.touches.length === 1) {
      this.oldClientX = this.oldClientX || evt.touches[0].clientX;
      dX = this.oldClientX - evt.touches[0].clientX;
      this.el.object3D.rotation.y -= dX / 100;
      this.oldClientX = evt.touches[0].clientX;
    }

    if (evt.touches.length === 2) {
      dX = evt.touches[0].clientX - evt.touches[1].clientX;
      dY = evt.touches[0].clientY - evt.touches[1].clientY;
      distance = Math.sqrt(dX * dX + dY * dY);
      oldDistance = this.oldDistance || distance;
      distanceDifference = oldDistance - distance;

      this.el.object3D.scale.x -= distanceDifference / 500;
      this.el.object3D.scale.y -= distanceDifference / 500;
      this.el.object3D.scale.z -= distanceDifference / 500;

      if (this.el.object3D.scale.x < 0.1) {
        this.el.object3D.scale.x = 0.1;
        this.el.object3D.scale.y = 0.1;
        this.el.object3D.scale.z = 0.1;
      }

      if (this.el.object3D.scale.x > 4.0) {
        this.el.object3D.scale.x = 4.0;
        this.el.object3D.scale.y = 4.0;
        this.el.object3D.scale.z = 4.0;
      }

      this.oldDistance = distance;
    }
  },

  onTouchEnd: function (evt) {
    this.oldClientX = undefined;
    if (evt.touches.length < 2) { this.oldDistance = undefined; }
  },

  onMouseUp: function (evt) {
    this.oldClientX = undefined;
  },

  onMouseMove: function (evt) {
    var dX;
    if (!this.oldClientX) { return; }
    dX = this.oldClientX - evt.clientX;
    this.el.object3D.rotation.y -= dX / 100;
    this.oldClientX = evt.clientX;
  },

  onMouseDown: function (evt) {
    this.oldClientX = evt.clientX;
  },

  onOrientationChange: function () {
    if (AFRAME.utils.device.isLandscape()) {
      this.el.object3D.position.z += 1.5;
    } else {
      this.el.object3D.position.z -= 1.5;
    }
  }
});
