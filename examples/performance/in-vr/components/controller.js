/* global AFRAME */
AFRAME.registerComponent('controller', {
  schema: {
    hand: {default: 'right'}
  },

  init: function () {
    let config = this.config;
    let data = this.data;
    let el = this.el;

    el.setAttribute('geometry', {primitive: 'box', depth: 0.15, height: 0.05, width: 0.05});
    el.setAttribute('material', {color: '#222'});

    // Track all types of controllers.
    el.setAttribute('daydream-controls', {hand: data.hand, model: false});
    el.setAttribute('gearvr-controls', {hand: data.hand, model: false});
    el.setAttribute('oculus-touch-controls', {hand: data.hand, model: false});
    el.setAttribute('vive-controls', {hand: data.hand, model: false});

    // Wait for controller to connect before adding raycaster.
    el.addEventListener('controllerconnected', function (evt) {
      let controllerConfig = config[evt.detail.name];

      if (!controllerConfig) { return; }

      el.setAttribute('raycaster', AFRAME.utils.extend({
        showLine: true
      }, controllerConfig.raycaster || {}));

      el.setAttribute('cursor', AFRAME.utils.extend({
        fuse: false
      }, controllerConfig.cursor));
    });
  },

  config: {
    'daydream-controls': {
      cursor: {downEvents: ['trackpaddown'], upEvents: ['trackpadup']}
    },

    'gearvr-controls': {
      cursor: {downEvents: ['trackpaddown'], upEvents: ['trackpadup']}
    },

    'oculus-touch-controls': {
      cursor: {downEvents: ['triggerdown'], upEvents: ['triggerup']}
    },

    'vive-controls': {
      cursor: {downEvents: ['triggerdown'], upEvents: ['triggerup']}
    }
  }
});
