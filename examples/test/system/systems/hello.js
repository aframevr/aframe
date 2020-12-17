/* global AFRAME */

/**
 * Create a hello system
 */
AFRAME.registerSystem('hello', {
  schema: {
    count: {default: 1000},
    random: {default: 0.1}
  },

  update: function () {
    const data = this.data;
    console.log('[system] update', data);
  }
});
AFRAME.registerComponent('hello', {
  schema: {
    count: {
      default: 0
    }
  },
  update: function () {
    const data = this.data;
    console.log('[component] update', data);
  }
});
