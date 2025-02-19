import * as THREE from 'three';
import { registerGeometry } from '../core/geometry.js';

registerGeometry('tetrahedron', {
  schema: {
    detail: {default: 0, min: 0, max: 5, type: 'int'},
    radius: {default: 1, min: 0}
  },

  init: function (data) {
    this.geometry = new THREE.TetrahedronGeometry(data.radius, data.detail);
  }
});
