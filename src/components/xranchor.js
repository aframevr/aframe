var registerComponent = require('../core/component').registerComponent;
// var THREE = require('../lib/three');
module.exports.Component = registerComponent('xr-anchor', {
  schema: {
    enabled: {default: true}
  },
  init: function () {
    this.added = false;
  },
  update: function (oldData) {
    // console.log("update called");
  },

  tick: function (t) {
    // console.log(t);
    // console.log(this.el.sceneEl.frameData);
    var scene = this.el.sceneEl.object3D;
    if (!this.added) {
      // console.log('checking',this.el.sceneEl.object3D);
      if (scene._floorGroup) {
        console.log('Found the floorGroup');
        this.added = true;
        this.el.setAttribute('visible', true);
      }
    }
    if (this.added) {
      this.el.object3D.position.copy(scene._floorGroup.position);
      this.el.object3D.rotation.copy(scene._floorGroup.rotation);
    }
  }
});
