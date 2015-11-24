var ANode = require('./a-node');
var constants = require('../constants/animation');
var registerElement = require('../a-register-element').registerElement;
var TWEEN = require('tween.js');
var utils = require('../utils/');

var DEFAULTS = constants.defaults;
var DIRECTIONS = constants.directions;
var EASING_FUNCTIONS = constants.easingFunctions;
var FILLS = constants.fills;
var REPEATS = constants.repeats;

/**
 * Animation element that applies Tween animation to parent element (entity).
 * Takes after the Web Animations spec.
 *
 * @namespace <a-animation>
 * @param {string} attribute - Value on entity to animate.
 * @param {string} begin - Event name.
 * @param {string} easing - Easing function of animation (e.g., ease, ease-in,
 *        ease-in-out, ease-out, linear).
 * @param {string} direction - Direction of the animation between from and to.
 *        alternate: Even iterations played as specified, odd iterations played in reverse
 *                   direction from way specified.
 *        alternate-reverse: Even iterations are played in the reverse direction from way
 *                           specified, odd iterations played as specified.
 *        normal: All iterations are played as specified.
 *        reverse: All iterations are played in reverse direction from way specified.
 * @param {number} dur - How long to run the animation in milliseconds.
 * @param {string} [fill=forwards] - Determines effect of animation when not in play.
 *        backwards: Before animation, set initial value to `from`.
 *        both: Before animation, backwards fill. After animation, forwards fill.
 *        forwards: After animation, value will stay at `to`.
 *        none: Animation has no effect when not in play.
 * @param {number} from - Start value. Defaults to the entity's current value for that attr.
 * @param {number|string} repeat - How the animation should repeat (e.g., number or
          `indefinite`).
 * @param {number} to - End value.
 * @member {number} count - Decrementing counter for how many cycles of animations left to
 *         run.
 * @member {Element} el - Entity which the animation is modifying to.
 * @member initValue - Value before animation started.
 * @member {bool} isRunning - Whether animation is currently running.
 * @member {object} tween - tween.js object.
 */
module.exports = registerElement('a-animation', {
  prototype: Object.create(ANode.prototype, {
    createdCallback: {
      value: function () {
        this.isRunning = false;
        this.tween = null;
      }
    },

    attachedCallback: {
      value: function () {
        var self = this;
        var el = self.el = self.parentNode;

        if (el.isNode) {
          init();
        } else {
          // To handle elements that are not yet `<a-object>`s (e.g., templates).
          el.addEventListener('nodeready', init.bind(self));
        }

        function init () {
          self.bindMethods();
          self.applyMixin();
          self.update();
          self.load();
        }
      }
    },

    attributeChangedCallback: {
      value: function (attr, oldVal, newVal) {
        if (!this.hasLoaded || !this.isRunning) { return; }
        this.stop();
        this.applyMixin();
        this.update();
      }
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
        var repeat = data.repeat === REPEATS.indefinite ? Infinity : 0;
        var to = utils.parseCoordinate(data.to);
        var toTemp;
        var yoyo = false;

        if (this.count === undefined) {
          this.count = repeat === Infinity ? 0 : parseInt(data.repeat, 10);
        }

        if (isNaN(begin)) { begin = 0; }

        // Store initial state.
        this.initValue = utils.extend({}, currentValue);

        // Handle indefinite + forwards + alternate yoyo edge-case (#405).
        if (repeat === Infinity && fill === FILLS.forwards &&
            [DIRECTIONS.alternate,
             DIRECTIONS.alternateReverse].indexOf(data.direction) !== -1) {
          yoyo = true;
        }

        // If reversing, swap from and to.
        if (direction === DIRECTIONS.reverse) {
          toTemp = to;
          to = utils.extend({}, from);
          from = utils.extend({}, toTemp);
        }

        // If fill is backwards or both, start animation at the specified from.
        if ([FILLS.backwards, FILLS.both].indexOf(fill) !== -1) {
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
      }
    },

    /**
     * Animation parameters changed. Stop current animation, get a new one, and start it.
     */
    update: {
      value: function () {
        var data = this.data;
        var begin = data.begin;
        // Cancel previous event listeners
        this.removeEventListeners(this.evt);
        this.addEventListeners(begin);
        // Store new event name.
        this.evt = begin;
        // If `begin` is a number, start the animation right away.
        if (!isNaN(begin)) {
          this.stop();
          this.start();
        }
      },
      writable: window.debug
    },

    /**
     * Callback for when a cycle of an animation is complete. Handles when to completely
     * finish the animation.
     *
     * If `repeat` is set to a value, this method is called after each repeat. Repeats are
     * handled by ending the current animation and creating a new one with `count` updated.
     * Note that this method is *not* called if repeat is set to `indefinite`.
     */
    onCompleted: {
      value: function () {
        var el = this.el;
        var data = this.data;
        this.isRunning = false;
        if ([FILLS.backwards, FILLS.none].indexOf(data.fill) !== -1) {
          el.setAttribute(data.attribute, this.initValue);
        }
        if (this.count === 0) {
          this.count = undefined;
          this.emit('animationend');
          return;
        }
        this.isRunning = false;
        this.count--;
        this.start();
      }
    },

    start: {
      value: function () {
        if (this.isRunning) { return; }
        this.tween = this.getTween();
        this.isRunning = true;
        this.tween.start();
        this.emit('animationstart');
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
        this.isRunning = false;
        el.setAttribute(data.attribute, this.initValue);
      },
      writable: true
    },

    /**
     * Handle alternating directions. Given the current direction, calculate the next one,
     * and store the current one.
     *
     * @param {string} direction
     * @returns {string} Direction that the next individual cycle of the animation will go
     *          towards.
     */
    getDirection: {
      value: function (direction) {
        if (direction === DIRECTIONS.alternate) {
          this.prevDirection =
            this.prevDirection === DIRECTIONS.normal ? DIRECTIONS.reverse : DIRECTIONS.normal;
          return this.prevDirection;
        }
        if (direction === DIRECTIONS.alternateReverse) {
          this.prevDirection =
            this.prevDirection === DIRECTIONS.reverse ? DIRECTIONS.normal : DIRECTIONS.reverse;
          return this.prevDirection;
        }
        return direction;
      }
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
      }
    },

    addEventListeners: {
      value: function (evts) {
        var el = this.el;
        var start = this.start.bind(this);
        utils.splitString(evts).forEach(function (evt) {
          el.addEventListener(evt, start);
        });
        el.addEventListener('stateadded', this.onStateAdded);
        el.addEventListener('stateremoved', this.onStateRemoved);
      }
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
      }
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
      }
    }
  })
});
