var THREE = require('../lib/three');
var VRNode = require('./core/vr-node');

module.exports = document.registerElement(
  'vr-fog',
  {
    prototype: Object.create(
      VRNode.prototype, {
        createdCallback: {
          value: function() {
            var color = this.getAttribute('color') || 0xFFFFFF;
            var near = parseFloat(this.getAttribute('near')) || 1;
            var far = parseFloat(this.getAttribute('far')) || 1000;
            this.fog = this.sceneEl.object3D.fog = new THREE.Fog( color, near, far );
            this.load();
          }
        }
      })
  }
);
