var registerGeometry = require('../core/geometry').registerGeometry;
var THREE = require('../lib/three');

registerGeometry('quad', {
  schema: {buffer: {default: false}},
  init: function (data) {
    var vertices = new THREE.BufferAttribute(
      new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]), 3);
    var geometry = this.geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', vertices);
  }
});
