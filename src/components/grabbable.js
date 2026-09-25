import { registerComponent } from '../core/component.js';

registerComponent('grabbable', {
  init: function () {
    this.el.setAttribute('obb-collider', 'centerModel: true');
  },

  remove: function () {
    this.el.removeAttribute('obb-collider');
  }
});
