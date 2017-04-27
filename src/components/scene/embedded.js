var registerComponent = require('../../core/component').registerComponent;

/**
 * Component to embed an a-frame scene within the layout of a 2D page.
 */
module.exports.Component = registerComponent('embedded', {
  dependencies: ['vr-mode-ui'],

  schema: {default: true},

  update: function () {
    var sceneEl = this.el;
    var enterVREl = sceneEl.querySelector('.a-enter-vr');
    if (this.data === true) {
      if (enterVREl) { enterVREl.classList.add('embedded'); }
      sceneEl.removeFullScreenStyles();
    } else {
      if (enterVREl) { enterVREl.classList.remove('embedded'); }
      sceneEl.addFullScreenStyles();
    }
  }

});
