/* global AFRAME */
AFRAME.registerComponent('controller', {
  schema: {
    hand: {default: 'right'}
  },

  init: function () {
    var config = this.config;
    var data = this.data;
    var el = this.el;

    el.setAttribute('geometry', {primitive: 'box', depth: 0.15, height: 0.05, width: 0.05});
    el.setAttribute('material', {color: '#222'});

    // Track all types of controllers.
    el.setAttribute('daydream-controls', {hand: data.hand, model: false});
    el.setAttribute('gearvr-controls', {hand: data.hand, model: false});
    el.setAttribute('meta-touch-controls', {hand: data.hand, model: false});
    el.setAttribute('vive-controls', {hand: data.hand, model: false});

    // Wait for controller to connect before adding raycaster.
    el.addEventListener('controllerconnected', function (evt) {
      var controllerConfig = config[evt.detail.name];

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

    'meta-touch-controls': {
      cursor: {downEvents: ['triggerdown'], upEvents: ['triggerup']}
    },

    'vive-controls': {
      cursor: {downEvents: ['triggerdown'], upEvents: ['triggerup']}
    }
  }
});
