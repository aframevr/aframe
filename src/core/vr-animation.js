var TWEEN = require('tween.js');

var VRNode = require('./vr-node');
var registerElement = require('../vr-register-element').registerElement;
var utils = require('../vr-utils');

var DEFAULTS = {
  attribute: 'rotation',
  begin: '0',
  dur: 1000,
  easing: 'ease',
  direction: 'normal',
  fill: 'none',
  from: { x: 0, y: 0, z: 0 },
  repeat: 0,
  to: undefined
};

var EASING_FUNCTIONS = {
  'ease': TWEEN.Easing.Cubic.InOut,
  'ease-in': TWEEN.Easing.Cubic.In,
  'ease-in-out': TWEEN.Easing.Cubic.InOut,
  'ease-out': TWEEN.Easing.Cubic.Out,
  'linear': TWEEN.Easing.Linear.None
};

/**
 * Animation element that applies Tween animation to parent element.
 *
 * @namespace <a-animation>
 * @param {string} attribute - Value to animate.
 * @param {string} begin - Event name.
 * @param {string} easing - Easing function of animation (e.g., ease, ease-in,
          ease-in-out, ease-out, linear).
 * @param {string} direction - Direction of the animation between from and to
          (e.g., alternate, alternate-reverse, normal, reverse).
 * @param {number} dur - event name.
 * @param {string} fill - Determines what values to apply before and after
          animation (e.g., forward, backwards, both, none).
 * @param {number} from - Start value.
 * @param {number|string} repeat - How the animation should repeat (e.g.,
          a number or `indefinite`).
 * @param {number} to - End value.
 */
module.exports = registerElement('vr-animation', {
  prototype: Object.create(VRNode.prototype, {
    attachedCallback: {
      value: function () {
        var el = this.el = this.parentNode;
        if (el.isNode) {
          this.init();
        } else {
          // To handle elements that are not yet `<vr-object>`s (e.g., templates).
          el.addEventListener('nodeready', this.init.bind(this));
        }
      },
      writable: window.debug
    },

    init: {
      value: function () {
        this.bindMethods();
        this.applyMixin();
        this.update();
        this.load();
      },
      writable: window.debug
    },

    /**
     * Preemptive binding to attach/detach event listeners (see `update`).
     */
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
        this.update();
      },
      writable: window.debug
    },

    update: {
      value: function () {
        var data = this.data;
        var begin = data.begin;
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
      value: function (evts) {
        var el = this.el;
        var start = this.start;
        utils.splitString(evts).forEach(function (evt) {
          el.addEventListener(evt, start);
        });
        el.addEventListener('stateadded', this.onStateAdded);
        el.addEventListener('stateremoved', this.onStateRemoved);
      },
      writable: window.debug
    },

    removeEventListeners: {
      value: function (evts) {
        var el = this.el;
        var start = this.start;
        utils.splitString(evts).forEach(function (evt) {
          el.removeEventListener(evt, start);
        });
        el.removeEventListener('stateadded', this.onStateAdded);
        el.removeEventListener('stateremoved', this.onStateRemoved);
      },
      writable: window.debug
    },

    onStateAdded: {
      value: function (evt) {
        if (evt.detail.state === this.data.begin) { this.start(); }
      },
      writable: true
    },

    onStateRemoved: {
      value: function (evt) {
        if (evt.detail.state === this.data.begin) { this.stop(); }
      },
      writable: true
    },

    /**
     * Creates a Tween.
     *
     * @returns {object}
     */
    getTween: {
      value: function () {
        // Stop previous tween.
        var data = this.data;
        var el = this.el;
        var attribute = data.attribute;
        var begin = parseInt(data.begin, 10);
        var currentValue = el.getComputedAttribute(attribute);
        var direction = this.getDirection(data.direction);
        var easing = EASING_FUNCTIONS[data.easing];
        var fill = data.fill;
        var from = data.from ? utils.parseCoordinate(data.from) : currentValue;
        var repeat = data.repeat === 'indefinite' ? Infinity : 0;
        var to = utils.parseCoordinate(data.to);
        var toTemp;
        var yoyo = false;

        if (this.count === undefined) {
          this.count = repeat === Infinity ? 0 : parseInt(data.repeat, 10);
        }

        if (isNaN(begin)) { begin = 0; }

        // Store initial state.
        this.initValue = utils.extend({}, currentValue);

        // Handle indefinite + forward + alternate yoyo edge-case (#405).
        if (repeat === Infinity && fill === 'forward' &&
            data.direction === 'alternate') {
          yoyo = true;
        }

        // If reversing, swap from and to.
        if (direction === 'reverse') {
          toTemp = to;
          to = utils.extend({}, from);
          from = utils.extend({}, toTemp);
        }

        // If fill is backwards or both, start animation at the specified from.
        if (fill === 'backwards' || fill === 'both') {
          el.setAttribute(attribute, from);
        }

        // Create Tween.
        return new TWEEN.Tween(utils.extend({}, from))
          .to(to, data.dur)
          .delay(begin)
          .easing(easing)
          .repeat(repeat)
          .yoyo(yoyo)
          .onUpdate(function () {
            el.setAttribute(data.attribute, this);
          })
          .onComplete(this.onCompleted.bind(this));
      },
      writable: window.debug
    },

    getDirection: {
      value: function (direction) {
        if (direction === 'alternate') {
          this.prevDirection =
            this.prevDirection === 'normal' ? 'reverse' : 'normal';
          return this.prevDirection;
        }
        if (direction === 'alternate-reverse') {
          this.prevDirection =
            this.prevDirection === 'reverse' ? 'normal' : 'reverse';
          return this.prevDirection;
        }
        return direction;
      },
      writable: window.debug
    },

    /**
     * Callback for when an animation is complete to handle when to completely
     * finish the animation.
     * If `repeat` is set to a value, this method is called after each repeat.
     */
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
          this.emit('animationend');
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
        if (this.running) { return; }
        this.tween = this.getTween();
        this.running = true;
        this.tween.start();
        this.emit('animationstart');
      },
      writable: true
    },

    /**
     * Applies animation data from a mixin element.
     * Works the same as component mixins but reimplemented because animations
     * aren't components.
     */
    applyMixin: {
      value: function () {
        var data = {};
        var elData;
        var mixinData;
        var mixinEl;

        // Get mixin data.
        mixinEl = document.querySelector('#' + this.getAttribute('mixin'));
        mixinData = mixinEl ? utils.getElData(mixinEl, DEFAULTS) : {};

        elData = utils.getElData(this, DEFAULTS);
        utils.extend(data, DEFAULTS, mixinData, elData);
        this.data = data;
      },
      writable: window.debug
    }
  })
});
