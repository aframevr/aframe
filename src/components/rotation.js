import * as THREE from 'three';
import { registerComponent } from '../core/component.js';
var degToRad = THREE.MathUtils.degToRad;

export var Component = registerComponent('rotation', {
  schema: {type: 'vec3'},

  /**
   * Updates object3D rotation.
   */
  update: function () {
    var data = this.data;
    var object3D = this.el.object3D;
    object3D.rotation.set(degToRad(data.x), degToRad(data.y), degToRad(data.z), 'YXZ');
  },

  remove: function () {
    // Pretty much for mixins.
    this.el.object3D.rotation.set(0, 0, 0);
  }
});
