/* global AFRAME */
AFRAME.registerComponent('fps-counter', {
  schema: {
    for90fps: {default: true}
  },

  init: function () {
    this.el.setAttribute('text', {align: 'center', side: 'double'});
    this.frameCount = 0;
    this.frameDuration = 0;
  },

  tick: function (t, dt) {
    var color;
    var fps;

    color = 'green';
    if (this.data.for90fps) {
      if (fps < 85) { color = 'yellow'; }
      if (fps < 80) { color = 'orange'; }
      if (fps < 75) { color = 'red'; }
    } else {
      if (fps < 55) { color = 'yellow'; }
      if (fps < 50) { color = 'orange'; }
      if (fps < 45) { color = 'red'; }
    }

    if (color) {
      this.el.setAttribute('text', 'color', color);
    }

    this.frameCount++;
    this.frameDuration += dt;

    if (this.frameCount === 10) {
      fps = 1000 / (this.frameDuration / this.frameCount);
      this.el.setAttribute('text', 'value', fps.toFixed(0) + ' fps');
      this.frameCount = 0;
      this.frameDuration = 0;
    }
  }
});
