import { registerComponent } from '../core/component.js';

export var Component = registerComponent('scale', {
  schema: {
    type: 'vec3',
    default: {x: 1, y: 1, z: 1}
  },

  update: function () {
    var data = this.data;
    var object3D = this.el.object3D;
    object3D.scale.set(data.x, data.y, data.z);
    object3D.matrixNeedsUpdate = true;
  },

  remove: function () {
    // Pretty much for mixins.
    this.el.object3D.scale.set(1, 1, 1);
    this.el.object3D.matrixNeedsUpdate = true;
  }
});
