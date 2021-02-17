/* global AFRAME, THREE */
AFRAME.registerComponent('ar-hit-test', {
  schema: {targetEl: {type: 'selector'}},

  init: function () {
    var self = this;
    var targetEl = this.data.targetEl;
    this.xrHitTestSource = null;
    this.viewerSpace = null;
    this.refSpace = null;

    this.el.sceneEl.renderer.xr.addEventListener(function () {
      self.viewerSpace = null;
      self.refSpace = null;
      self.xrHitTestSource = null;
    });

    this.el.sceneEl.addEventListener('enter-vr', function () {
      var el = self.el;
      var targetEl = self.data.targetEl;
      var session;

      if (!self.el.sceneEl.is('ar-mode')) { return; }

      session = self.el.sceneEl.renderer.xr.getSession();

      self.originalPosition = targetEl.object3D.position.clone();
      self.el.object3D.visible = true;

      session.addEventListener('select', function () {
        var position = el.getAttribute('position');
        targetEl.setAttribute('position', position);
        document.getElementById('light').setAttribute('position', {
          x: (position.x - 2),
          y: (position.y + 4),
          z: (position.z + 2)
        });
      });

      session.requestReferenceSpace('viewer').then(function (space) {
        self.viewerSpace = space;
        session.requestHitTestSource({space: self.viewerSpace})
            .then(function (hitTestSource) {
              self.xrHitTestSource = hitTestSource;
            });
      });

      session.requestReferenceSpace('local-floor').then(function (space) {
        self.refSpace = space;
      });
    });

    this.el.sceneEl.addEventListener('exit-vr', function () {
      if (self.originalPosition) { targetEl.object3D.position.copy(self.originalPosition); }
      self.el.object3D.visible = false;
    });
  },

  tick: function () {
    var frame;
    var xrViewerPose;
    var hitTestResults;
    var pose;
    var inputMat;
    var position;

    if (this.el.sceneEl.is('ar-mode')) {
      if (!this.viewerSpace) { return; }
      frame = this.el.sceneEl.frame;
      if (!frame) { return; }
      xrViewerPose = frame.getViewerPose(this.refSpace);

      if (this.xrHitTestSource && xrViewerPose) {
        hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
        if (hitTestResults.length > 0) {
          pose = hitTestResults[0].getPose(this.refSpace);

          inputMat = new THREE.Matrix4();
          inputMat.fromArray(pose.transform.matrix);

          position = new THREE.Vector3();
          position.setFromMatrixPosition(inputMat);
          this.el.setAttribute('position', position);
        }
      }
    }
  }
});
