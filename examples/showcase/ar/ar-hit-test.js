/* global AFRAME, THREE */
AFRAME.registerComponent('ar-hit-test', {
  init: function () {
    var self = this;
    var dinoEl = document.getElementById('dino');
    this.xrHitTestSource = null;
    this.viewerSpace = null;
    this.refSpace = null;

    this.el.sceneEl.renderer.xr.addEventListener('sessionend', (ev) => {
      this.viewerSpace = null;
      this.refSpace = null;
      this.xrHitTestSource = null;
    });

    this.el.sceneEl.addEventListener('enter-vr', function () {
      self.originalPosition = dinoEl.object3D.position.clone();
      self.el.object3D.visible = true;
    });

    this.el.sceneEl.addEventListener('exit-vr', function () {
      dinoEl.object3D.position.copy(self.originalPosition);
      self.el.object3D.visible = false;
    });

    this.el.sceneEl.renderer.xr.addEventListener('sessionstart', (ev) => {
      var session = this.el.sceneEl.renderer.xr.getSession();

      var element = this.el;
      session.addEventListener('select', function () {
        var position = element.getAttribute('position');

        document.getElementById('dino').setAttribute('position', position);
        document.getElementById('light').setAttribute('position', {
          x: (position.x - 2),
          y: (position.y + 4),
          z: (position.z + 2)
        });
      });

      session.requestReferenceSpace('viewer').then((space) => {
        this.viewerSpace = space;
        session.requestHitTestSource({space: this.viewerSpace})
            .then((hitTestSource) => {
              this.xrHitTestSource = hitTestSource;
            });
      });

      session.requestReferenceSpace('local-floor').then((space) => {
        this.refSpace = space;
      });
    });
  },
  tick: function () {
    if (this.el.sceneEl.is('ar-mode')) {
      if (!this.viewerSpace) return;

      var frame = this.el.sceneEl.frame;
      var xrViewerPose = frame.getViewerPose(this.refSpace);

      if (this.xrHitTestSource && xrViewerPose) {
        var hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
        if (hitTestResults.length > 0) {
          var pose = hitTestResults[0].getPose(this.refSpace);

          var inputMat = new THREE.Matrix4();
          inputMat.fromArray(pose.transform.matrix);

          var position = new THREE.Vector3();
          position.setFromMatrixPosition(inputMat);
          this.el.setAttribute('position', position);
        }
      }
    }
  }
});
