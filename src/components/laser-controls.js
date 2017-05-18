var registerComponent = require('../core/component').registerComponent;
var utils = require('../utils/');

registerComponent('laser-controls', {
  schema: {
    hand: {default: 'right'}
  },

  init: function () {
    var config = this.config;
    var data = this.data;
    var el = this.el;

    // Set all controller models.
    el.setAttribute('daydream-controls', {hand: data.hand});
    el.setAttribute('gearvr-controls', {hand: data.hand});
    el.setAttribute('oculus-touch-controls', {hand: data.hand});
    el.setAttribute('vive-controls', {hand: data.hand});

    // Wait for controller to connect before
    el.addEventListener('controllerconnected', function (evt) {
      var controllerConfig = config[evt.detail.name];

      if (!controllerConfig) { return; }

      el.setAttribute('raycaster', utils.extend({
        showLine: true
      }, controllerConfig.raycaster || {}));

      el.setAttribute('cursor', utils.extend({
        fuse: false
      }, controllerConfig.cursor));
    });
  },

  config: {
    'daydream-controls': {
      cursor: {downEvents: ['trackpaddown'], upEvents: ['trackpadup']}
    },

    'gearvr-controls': {
      cursor: {downEvents: ['trackpaddown'], upEvents: ['trackpadup']},
      raycaster: {origin: {x: 0, y: 0.0005, z: 0}}
    },

    'oculus-touch-controls': {
      cursor: {downEvents: ['triggerdown'], upEvents: ['triggerup']},
      raycaster: {origin: {x: 0.001, y: 0, z: 0.065}, direction: {x: 0, y: -0.8, z: -1}}
    },

    'vive-controls': {
      cursor: {downEvents: ['triggerdown'], upEvents: ['triggerup']}
    }
  }
});
