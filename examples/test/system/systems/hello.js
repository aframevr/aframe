/* global AFRAME */

/**
 * Create a hello system
 */
AFRAME.registerSystem('hello', {
  schema: {
    count: { default: 1000 },
    random: { default: 0.1 }
  },

  update: function () {
    const data = this.data;
    console.group('system');
    console.trace('[system] update', data);
    console.groupEnd('system');
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
    console.group('component');
    console.trace('[component] update', data);
    console.groupEnd('component');
  }
});
