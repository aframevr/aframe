var registerGeometry = require('../core/geometry').registerGeometry;
var THREE = require('../lib/three');

var degToRad = THREE.Math.degToRad;

registerGeometry('sphere', {
  schema: {
    radius: {default: 1, min: 0},
    phiLength: {default: 360},
    phiStart: {default: 0, min: 0},
    thetaLength: {default: 180, min: 0},
    thetaStart: {default: 0},
    segmentsHeight: {default: 18, min: 2, type: 'int'},
    segmentsWidth: {default: 36, min: 3, type: 'int'}
  },

  init: function (data) {
    this.geometry = new THREE.SphereGeometry(
      data.radius, data.segmentsWidth, data.segmentsHeight, degToRad(data.phiStart),
      degToRad(data.phiLength), degToRad(data.thetaStart), degToRad(data.thetaLength));
  }
});
