/* global AFRAME, THREE */

AFRAME.registerGeometry('shadow-plane', {
  schema: {
    width: { default: 5, min: 0 },
    height: { default: 5, min: 0 }
  },

  init: function (data) {
    this.geometry = new THREE.PlaneGeometry(data.width, data.height);
    this.geometry.rotateX(-Math.PI / 2);
  }
});

/**
Component to hide the shadow whilst the user is using ar-hit-test because they tend to interact poorly
*/
AFRAME.registerComponent('ar-shadow-helper', {
  schema: {
    target: {
      type: 'selector'
    },
    startVisibleInAR: {
      default: false
    }
  },
  init: function () {
    var self = this;
    this.el.object3D.visible = false;

    this.el.sceneEl.addEventListener('enter-vr', function () {
      if (self.el.sceneEl.is('ar-mode')) {
        self.el.object3D.visible = self.data.startVisibleInAR;
      }
    });
    this.el.sceneEl.addEventListener('exit-vr', function () {
      self.el.object3D.visible = false;
    });

    this.el.sceneEl.addEventListener('ar-hit-test-select-start', function () {
      self.el.object3D.visible = false;
    });

    this.el.sceneEl.addEventListener('ar-hit-test-select', function () {
      self.el.object3D.visible = true;
    });
  },
  tick: function () {
    if (this.data.target) {
      this.el.object3D.position.copy(this.data.target.object3D.position);
      this.el.object3D.quaternion.copy(this.data.target.object3D.quaternion);
    }
  }
});
