/* global AFRAME */

/**
 * Create a hello system
 */
AFRAME.registerSystem('sync-color', {
  schema: {
    color1: { type: 'color', default: '#fff' },
    color2: { type: 'color', default: '#000' },
    interval: { default: 500 }
  },
  intervalID: undefined,
  update: function () {
    console.log('update system', this.data);
    const {color1, color2, interval} = this.data;
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
    let toggle = true;
    this.intervalID = setInterval(() => {
      for (const el of this.els) {
        el.setAttribute('material', {color: toggle ? color1 : color2});
      }
      toggle = !toggle;
    }, interval);
  },
  els: [],
  register: function (el) {
    this.els.push(el);
  }
});
AFRAME.registerComponent('sync-color', {
  schema: {
  },
  update: function () {
    this.system.register(this.el);
  }
});
