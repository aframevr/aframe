import * as THREE from 'three';
import { registerGeometry } from '../core/geometry.js';

registerGeometry('torusKnot', {
  schema: {
    p: {default: 2, min: 1},
    q: {default: 3, min: 1},
    radius: {default: 1, min: 0},
    radiusTubular: {default: 0.2, min: 0},
    segmentsRadial: {default: 8, min: 3, type: 'int'},
    segmentsTubular: {default: 100, min: 3, type: 'int'}
  },

  init: function (data) {
    this.geometry = new THREE.TorusKnotGeometry(
      data.radius, data.radiusTubular * 2, data.segmentsTubular, data.segmentsRadial,
      data.p, data.q);
  }
});
