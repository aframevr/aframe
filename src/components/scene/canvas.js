var register = require('../../core/component').registerComponent;

module.exports.Component = register('canvas', {
  schema: {
    canvas: {
      type: 'selector',
      default: undefined
    },
    height: {
      default: 100
    },
    width: {
      default: 100
    }
  },

  update: function () {
    var data = this.data;
    var canvas = data.canvas;
    var scene = this.el;

    // No updating canvas.
    if (scene.canvas) { return; }

    // Inject canvas if one not specified with height and width.
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.classList.add('a-canvas');
      canvas.style.height = data.height + '%';
      canvas.style.width = data.width + '%';
      scene.appendChild(canvas);
    } else {
      canvas.provided = true;
    }

    // Prevent overscroll on mobile.
    canvas.addEventListener('touchmove', function (event) {
      event.preventDefault();
    });

    // Set canvas on scene.
    scene.canvas = canvas;
    scene.emit('render-target-loaded', {
      target: canvas
    });
  }
});
