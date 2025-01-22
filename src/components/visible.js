import { registerComponent } from '../core/component.js';

/**
 * Visibility component.
 */
export var Component = registerComponent('visible', {
  schema: {default: true},

  update: function () {
    this.el.object3D.visible = this.data;
  }
});
