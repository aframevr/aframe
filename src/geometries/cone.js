var registerGeometry = require('../core/geometry').registerGeometry;
var THREE = require('../lib/three');

var degToRad = THREE.MathUtils.degToRad;

registerGeometry('cone', {
  schema: {
    height: {default: 1, min: 0},
    openEnded: {default: false},
    radiusBottom: {default: 1, min: 0},
    radiusTop: {default: 0.01, min: 0},
    segmentsHeight: {default: 18, min: 1, type: 'int'},
    segmentsRadial: {default: 36, min: 3, type: 'int'},
    thetaLength: {default: 360, min: 0},
    thetaStart: {default: 0}
  },

  init: function (data) {
    this.geometry = new THREE.CylinderGeometry(
        data.radiusTop, data.radiusBottom, data.height, data.segmentsRadial,
        data.segmentsHeight, data.openEnded, degToRad(data.thetaStart),
        degToRad(data.thetaLength));
  }
});
