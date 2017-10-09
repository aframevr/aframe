var registerComponent = require('../core/component').registerComponent;
var utils = require('../utils/');
var bind = utils.bind;

registerComponent('laser-controls', {
  schema: {
    hand: {default: 'right'},
    model: {default: true}
  },

  init: function () {
    var data = this.data;
    var el = this.el;
    var controllerConfig = {hand: data.hand, model: data.model};

    // Set all controller models.
    el.setAttribute('daydream-controls', controllerConfig);
    el.setAttribute('gearvr-controls', controllerConfig);
    el.setAttribute('oculus-touch-controls', controllerConfig);
    el.setAttribute('vive-controls', controllerConfig);
    el.setAttribute('windows-motion-controls', controllerConfig);

    // Bind methods
    this.createRay = bind(this.createRay, this);
    this.hideRay = bind(this.hideRay, this);
    this.onModelReady = bind(this.onModelReady, this);

    // Wait for controller to connect, or have a valid pointing pose, before creating ray
    el.addEventListener('controllerconnected', this.createRay);
    el.addEventListener('controllerdisconnected', this.hideRay);
    el.addEventListener('controllermodelready', this.onModelReady);
  },
  remove: function () {
    this.el.removeEventListener('controllerconnected', this.createRay);
    this.el.removeEventListener('controllerdisconnected', this.hideRay);
    this.el.removeEventListener('controllermodelready', this.onModelReady);
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
  onModelReady: function (evt) {
    this.createRay(evt);
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
