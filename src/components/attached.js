var registerComponent = require('../core/component').registerComponent;

/**
 * Attached component.
 */
module.exports.Component = registerComponent('attached', {
  schema: {default: true},

  update: function () {
    if (this.data) {
      this.el.attachToScene();
    } else {
      this.el.detachFromScene();
    }
  }
});
