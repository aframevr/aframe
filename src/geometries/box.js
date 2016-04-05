var registerGeometry = require('../core/geometry').registerGeometry;
var THREE = require('../lib/three');

registerGeometry('box', {
  schema: {
    depth: {default: 1, min: 0},
    height: {default: 1, min: 0},
    width: {default: 1, min: 0}
  },

  init: function (data) {
    this.geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
  }
});
