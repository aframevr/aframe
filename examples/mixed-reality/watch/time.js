/* global AFRAME */
AFRAME.registerComponent('time', {
  tick: function () {
    var date = new Date();
    this.el.setAttribute('text', 'value',
      date.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false}) +
      ':' + date.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false}));
  }
});
