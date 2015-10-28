var registerElement = require('../vr-register-element').registerElement;

var TWEEN = require('tween.js');
var VRNode = require('./vr-node');
var utils = require('../vr-utils');

var defaults = {
  attribute: 'rotation',
  begin: '0',
  dur: 1000,
  easing: 'ease',
  direction: 'normal',
  fill: 'none',
  from: undefined,
  repeat: 0,
  to: undefined
};

var easingFunctions = {
  'ease': TWEEN.Easing.Cubic.InOut,
  'linear': TWEEN.Easing.Linear.None,
  'ease-in': TWEEN.Easing.Cubic.In,
  'ease-out': TWEEN.Easing.Cubic.Out,
  'ease-in-out': TWEEN.Easing.Cubic.InOut
};

module.exports = registerElement(
  'vr-animation', {
    prototype: Object.create(
      VRNode.prototype, {
        attachedCallback: {
          value: function () {
            this.el = this.parentNode;
            // preemptive binding to attach/dettach event listeners (see update method)
            this.bindMethods();
            this.applyMixin();
            this.load();
          },
          writable: window.debug
        },

        bindMethods: {
          value: function () {
            this.start = this.start.bind(this);
            this.stop = this.stop.bind(this);
            this.onStateAdded = this.onStateAdded.bind(this);
            this.onStateRemoved = this.onStateRemoved.bind(this);
          },
          writable: window.debug
        },

        attributeChangedCallback: {
          value: function () {
            this.stop();
            this.applyMixin();
          },
          writable: window.debug
        },

        update: {
          value: function () {
            var data = this.data;
            var begin = data.begin;
            // begin is an event name
            // Cancel previous event listeners
            this.removeEventListeners(this.evt);
            this.addEventListeners(begin);
            // Store new event name
            this.evt = begin;
            // If begin is a number we start the animation right away
            if (!isNaN(begin)) {
              this.stop();
              this.start();
              return;
            }
          }
        },

        addEventListeners: {
          value: function (evt) {
            var el = this.el;
            el.addEventListener(evt, this.start);
            el.addEventListener('stateadded', this.onStateAdded);
            el.addEventListener('stateremoved', this.onStateRemoved);
          },
          writable: window.debug
        },

        removeEventListeners: {
          value: function (evt) {
            var el = this.el;
            el.removeEventListener(evt, this.start);
            el.removeEventListener('stateadded', this.onStateAdded);
            el.removeEventListener('stateremoved', this.onStateRemoved);
          },
          writable: window.debug
        },

        onStateAdded: {
          value: function (evt) {
            if (evt.detail.state === this.data.begin) {
              this.start();
            }
          },
          writable: true
        },

        onStateRemoved: {
          value: function (evt) {
            if (evt.detail.state === this.data.begin) {
              this.stop();
            }
          },
          writable: true
        },

        init: {
          value: function () {
            // Stop previous tween
            var data = this.data;
            var repeat = data.repeat === 'indefinite' ? Infinity : 0;
            var el = this.el;
            var attribute = data.attribute;
            var current = el.getComputedAttribute(attribute);
            var from = data.from ? utils.parseCoordinate(data.from) : current;
            var tween = this.tween;
            var begin = parseInt(data.begin, 10);
            var to = utils.parseCoordinate(data.to);
            var easing = easingFunctions[data.easing];
            var fill = data.fill;
            var count = this.count;
            if (count === undefined) {
              this.count = repeat !== Infinity ? parseInt(data.repeat, 10) : 0;
            }
            // Begin is an event name
            if (isNaN(begin)) { begin = 0; }
            // Save a copy of current value to restore it later
            this.initValue = utils.mixin({}, current);
            var direction = this.getDirection(data.direction);
            var toTemp = to;
            // Swap from and to
            if (direction === 'reverse') {
              to = utils.mixin({}, from);
              from = utils.mixin({}, toTemp);
            }
            if (fill === 'backwards' || fill === 'both') {
              el.setAttribute(attribute, from);
            }
            this.tween = new TWEEN.Tween(from)
              .to(to, data.dur)
              .delay(begin)
              .easing(easing)
              .repeat(repeat)
              .onUpdate(function () {
                el.setAttribute(data.attribute, this);
              })
              .onComplete(this.onCompleted.bind(this));
            return tween;
          },
          writable: window.debug
        },

        getDirection: {
          value: function (direction) {
            if (direction === 'alternate') {
              this.lastDirection = this.lastDirection === 'normal' ? 'reverse' : 'normal';
              return this.lastDirection;
            }
            if (direction === 'alternate-reverse') {
              this.lastDirection = this.lastDirection === 'reverse' ? 'normal' : 'reverse';
              return this.lastDirection;
            }
            return direction;
          },
          writable: window.debug
        },

        onCompleted: {
          value: function () {
            var el = this.el;
            var data = this.data;
            this.running = false;
            if (data.fill === 'none') {
              el.setAttribute(data.attribute, this.initValue);
            }
            if (this.count === 0) {
              this.count = undefined;
              return;
            }
            this.running = false;
            this.count -= 1;
            this.start();
          },
          writable: true
        },

        stop: {
          value: function () {
            var el = this.el;
            var data = this.data;
            var tween = this.tween;
            if (!tween) { return; }
            tween.stop();
            this.running = false;
            el.setAttribute(data.attribute, this.initValue);
          },
          writable: true
        },

        start: {
          value: function () {
            var tween;
            if (this.running) { return; }
            this.init();
            tween = this.tween;
            this.running = true;
            tween.start();
          },
          // For preemptive binding. See update method
          writable: true
        },

        applyMixin: {
          value: function () {
            var data = {};
            var mixinData = this.getMixinData();
            var elData = this.getElData(this);
            utils.mixin(data, defaults);
            utils.mixin(data, mixinData);
            utils.mixin(data, elData);
            this.data = data;
            this.update();
          },
          writable: window.debug
        },

        getMixinData: {
          value: function () {
            var mixinId = this.getAttribute('mixin');
            var mixinEl = document.querySelector('#' + mixinId);
            if (!mixinEl) { return {}; }
            return this.getElData(mixinEl);
          },
          writable: window.debug
        },

        getElData: {
          value: function (el) {
            var data = {};
            Object.keys(defaults).forEach(copyAttribute);
            function copyAttribute (key) {
              if (el.hasAttribute(key)) {
                data[key] = el.getAttribute(key);
              }
            }
            return data;
          },
          writable: window.debug
        }
      })
  }
);
