/* global AFRAME */

/**
 * Draw dynamic colorful rectangles.
 */
AFRAME.registerComponent('draw-canvas-rectangles', {
  schema: {type: 'selector'},

  init: function () {
    var canvas = this.canvas = this.data;
    var ctx = this.ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  },

  tick: function (t) {
    var canvas = this.canvas;
    var ctx = this.ctx;
    var x;
    var y;
    var hue = t / 10;

    // Bottom layer rectangle.
    ctx.fillStyle = 'hsl(' + hue + ', 50%, 80%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Middle layer rectangle.
    hue = t / 15;
    ctx.fillStyle = 'hsl(' + hue + ', 50%, 60%)';
    x = canvas.width / 10;
    y = canvas.height / 10;
    ctx.fillRect(x, y, canvas.width - x * 2, canvas.height - y * 2);

    // Top layer rectangle.
    hue = t / 20;
    ctx.fillStyle = 'hsl(' + hue + ', 50%, 40%)';
    x = canvas.width / 5;
    y = canvas.height / 5;
    ctx.fillRect(x, y, canvas.width - x * 2, canvas.height - y * 2);
  }
});
