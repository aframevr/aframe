require('../vr-register-element');

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

module.exports = document.registerElement(
  'vr-animation', {
    prototype: Object.create(
      VRNode.prototype, {
        attachedCallback: {
          value: function () {
            this.el = this.parentNode;
            // preemptive binding to attach/dettach event listeners (see update method)
            this.start = this.start.bind(this);
            this.applyMixin();
            this.load();
          }
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
            var el = this.el;
            var evt = this.evt;
            var data = this.data;
            var begin = data.begin;
            // begin is an event name
            // Cancel previous event listener
            if (evt) { el.removeEventListener(evt, this.start); }
            // Store new event name
            this.evt = begin;
            // New event listener
            el.addEventListener('click', this.start);
            // If begin is a number we start the animation righ away
            if (!isNaN(begin)) {
              this.stop();
              this.start();
              return;
            }
          }
        },

        init: {
          value: function () {
            // Stop previous tween
            var data = this.data;
            var repeat = data.repeat === 'indefinite' ? Infinity : 0;
            var el = this.el;
            var attribute = data.attribute;
            var current = el.getAttribute(attribute);
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
          }
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
          }
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
          }
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
          }
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
                data[key] = el.getAttribute(key, defaults[key]);
              }
            }
            return data;
          },
          writable: window.debug
        }
      })
  }
);
