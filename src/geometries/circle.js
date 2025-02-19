import * as THREE from 'three';
import { registerGeometry } from '../core/geometry.js';

var degToRad = THREE.MathUtils.degToRad;

registerGeometry('circle', {
  schema: {
    radius: {default: 1, min: 0},
    segments: {default: 32, min: 3, type: 'int'},
    thetaLength: {default: 360, min: 0},
    thetaStart: {default: 0}
  },

  init: function (data) {
    this.geometry = new THREE.CircleGeometry(
      data.radius, data.segments, degToRad(data.thetaStart), degToRad(data.thetaLength));
  }
});
