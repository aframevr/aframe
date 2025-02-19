import * as THREE from 'three';
import { registerGeometry } from '../core/geometry.js';

registerGeometry('dodecahedron', {
  schema: {
    detail: {default: 0, min: 0, max: 5, type: 'int'},
    radius: {default: 1, min: 0}
  },

  init: function (data) {
    this.geometry = new THREE.DodecahedronGeometry(data.radius, data.detail);
  }
});
