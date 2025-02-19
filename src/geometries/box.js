import * as THREE from 'three';
import { registerGeometry } from '../core/geometry.js';

registerGeometry('box', {
  schema: {
    depth: {default: 1, min: 0},
    height: {default: 1, min: 0},
    width: {default: 1, min: 0},
    segmentsHeight: {default: 1, min: 1, max: 20, type: 'int'},
    segmentsWidth: {default: 1, min: 1, max: 20, type: 'int'},
    segmentsDepth: {default: 1, min: 1, max: 20, type: 'int'}
  },

  init: function (data) {
    this.geometry = new THREE.BoxGeometry(
      data.width, data.height, data.depth,
      data.segmentsWidth, data.segmentsHeight, data.segmentsDepth);
  }
});
