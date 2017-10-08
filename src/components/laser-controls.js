var registerComponent = require('../core/component').registerComponent;
var utils = require('../utils/');
var bind = utils.bind;

registerComponent('laser-controls', {
  schema: {
    hand: {default: 'right'}
  },

  init: function () {
    var data = this.data;
    var el = this.el;

    // Set all controller models.
    el.setAttribute('daydream-controls', {hand: data.hand});
    el.setAttribute('gearvr-controls', {hand: data.hand});
    el.setAttribute('oculus-touch-controls', {hand: data.hand});
    el.setAttribute('vive-controls', {hand: data.hand});
    el.setAttribute('windows-motion-controls', {hand: data.hand});

    // Bind methods
    this.createRay = bind(this.createRay, this);
    this.hideRay = bind(this.hideRay, this);
    this.setModelReady = bind(this.setModelReady, this);

    // Wait for controller to connect, or have a valid pointing pose, before creating ray
    el.addEventListener('controllerconnected', this.createRay);
    el.addEventListener('controllerdisconnected', this.hideRay);
    el.addEventListener('controllermodelready', this.createRay);
    el.addEventListener('controllermodelready', this.setModelReady);
  },
  remove: function () {
    this.el.removeEventListener('controllerconnected', this.createRay);
    this.el.removeEventListener('controllerdisconnected', this.hideRay);
    this.el.removeEventListener('controllermodelready', this.createRay);
    this.el.removeEventListener('controllermodelready', this.setModelReady);
  },
  createRay: function (evt) {
    var controllerConfig = this.config[evt.detail.name];

    if (!controllerConfig) { return; }

    // Show the line unless a particular config opts to hide it, until a controllermodelready
    // event comes through.
    var raycasterConfig = utils.extend({
      showLine: true
    }, controllerConfig.raycaster || {});

    // The controllermodelready event contains a rayOrigin that takes into account
    // offsets specific to the loaded model.
    if (evt.detail.rayOrigin) {
      raycasterConfig.origin = evt.detail.rayOrigin.origin;
      raycasterConfig.direction = evt.detail.rayOrigin.direction;
      raycasterConfig.showLine = true;
    }

    // Only apply a default raycaster if it does not yet exist. This prevents it overwriting
    // config applied from a controllermodelready event.
    if (evt.detail.rayOrigin || !this.modelReady) {
      this.el.setAttribute('raycaster', raycasterConfig);
    } else {
      this.el.setAttribute('raycaster', 'showLine', true);
    }

    this.el.setAttribute('cursor', utils.extend({
      fuse: false
    }, controllerConfig.cursor));
  },
  hideRay: function () {
    this.el.setAttribute('raycaster', 'showLine', false);
  },
  setModelReady: function () {
    this.modelReady = true;
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
    },

    'windows-motion-controls': {
      cursor: {downEvents: ['triggerdown'], upEvents: ['triggerup']},
      raycaster: {showLine: false}
    }
  }
});
