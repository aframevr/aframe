var registerGeometry = require('../core/geometry').registerGeometry;
var THREE = require('../lib/three');

var degToRad = THREE.Math.degToRad;

registerGeometry('ring', {
  schema: {
    radiusInner: {default: 0.8, min: 0},
    radiusOuter: {default: 1.2, min: 0},
    segmentsPhi: {default: 10, min: 1, type: 'int'},
    segmentsTheta: {default: 32, min: 3, type: 'int'},
    thetaLength: {default: 360, min: 0},
    thetaStart: {default: 0}
  },

  init: function (data) {
    this.geometry = new THREE.RingGeometry(
        data.radiusInner, data.radiusOuter, data.segmentsTheta, data.segmentsPhi,
        degToRad(data.thetaStart), degToRad(data.thetaLength));
  }
});
