import AFRAME from 'aframe';
AFRAME.registerComponent('effect-controls', {
  schema: {
    hand: { type: 'string', default: 'left' }
  },

  events: {
    pinchstarted: function () {
      this.toggleEffect();
    },
    buttondown: function () {
      this.toggleEffect();
    }
  },

  init: function () {
    // initialize control variable
    this.effectEnabled = true;

    // set the proper controller on the specified hand
    this.el.setAttribute('meta-touch-controls', {
      hand: this.data.hand
    });
    this.el.setAttribute('hand-tracking-controls', {
      hand: this.data.hand
    });
  },

  toggleEffect: function () {
    // toggle control variable and effect
    this.effectEnabled = !this.effectEnabled;
    this.el.sceneEl.setAttribute('bloom', { enabled: this.effectEnabled });
  }
});
