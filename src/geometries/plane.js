var registerGeometry = require('../core/geometry').registerGeometry;
var THREE = require('../lib/three');

registerGeometry('plane', {
  schema: {
    height: {default: 1, min: 0},
    width: {default: 1, min: 0}
  },

  init: function (data) {
    this.geometry = new THREE.PlaneBufferGeometry(data.width, data.height);
  }
});
