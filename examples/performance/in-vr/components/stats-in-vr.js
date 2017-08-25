/* global AFRAME */
AFRAME.registerComponent('stats-in-vr', {
  schema: {
    // Number of frames for moving average.
    frames: {default: 30}
  },

  init: function () {
    this.renderTimes = [];
  },

  tick: function (t, dt) {
    var color;
    var fps;
    var renderTimes = this.renderTimes;

    renderTimes.push(dt);
    if (renderTimes.length > this.data.frames) { renderTimes.shift(); }

    fps = renderTimes.length / (renderTimes.reduce(sum) / 1000);

    color = 'green';
    if (fps < 80) {
      color = 'red';
    } else if (fps < 85) {
      color = 'orange';
    } else if (fps < 89) {
      color = 'yellow';
    }

    if (color) { this.el.setAttribute('text', 'color', color); }
    this.el.setAttribute('text', 'value', fps.toFixed(0));
  }
});

function sum (a, b) {
  return a + b;
}
