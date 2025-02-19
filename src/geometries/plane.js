import * as THREE from 'three';
import { registerGeometry } from '../core/geometry.js';

registerGeometry('plane', {
  schema: {
    height: {default: 1, min: 0},
    width: {default: 1, min: 0},
    segmentsHeight: {default: 1, min: 1, max: 20, type: 'int'},
    segmentsWidth: {default: 1, min: 1, max: 20, type: 'int'}
  },

  init: function (data) {
    this.geometry = new THREE.PlaneGeometry(data.width, data.height, data.segmentsWidth, data.segmentsHeight);
  }
});
