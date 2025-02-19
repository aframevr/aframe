import * as THREE from 'three';
import { registerGeometry } from '../core/geometry.js';

var degToRad = THREE.MathUtils.degToRad;

registerGeometry('torus', {
  schema: {
    arc: {default: 360},
    radius: {default: 1, min: 0},
    radiusTubular: {default: 0.2, min: 0},
    segmentsRadial: {default: 36, min: 2, type: 'int'},
    segmentsTubular: {default: 32, min: 3, type: 'int'}
  },

  init: function (data) {
    this.geometry = new THREE.TorusGeometry(
      data.radius, data.radiusTubular * 2, data.segmentsRadial, data.segmentsTubular,
      degToRad(data.arc));
  }
});
