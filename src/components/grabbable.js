var registerComponent = require('../core/component').registerComponent;

registerComponent('grabbable', {
  init: function () {
    this.el.setAttribute('obb-collider', 'centerModel: true');
  }
});
