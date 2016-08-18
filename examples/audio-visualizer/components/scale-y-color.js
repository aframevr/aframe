/* global AFRAME */

/* Change color at different levels of scale. */
AFRAME.registerComponent('scale-y-color', {
  schema: {
    from: {type: 'vec3', default: {x: 0, y: 0, z: 0}},
    to: {type: 'vec3', default: {x: 255, y: 255, z: 255}},
    maxScale: {default: 20}
  },

  tick: function (time) {
    var data = this.data;
    var el = this.el;

    if (time - this.time < 50) { return; }
    this.time = time;

    var scaleY = el.getComputedAttribute('scale').y;
    var percentage = scaleY / data.maxScale;
    el.setAttribute('material', 'color', '#' + rgbToHex(
      (data.to.x - data.from.x) * percentage,
      (data.to.y - data.from.y) * percentage,
      (data.to.z - data.from.z) * percentage
    ));
  }
});

function rgbToHex (r, g, b) {
  var bin = r << 16 | g << 8 | b;
  return (function (h) {
    return new Array(7 - h.length).join('0') + h;
  })(bin.toString(16).toUpperCase());
}
