var ANode = require('./a-node');
var constants = require('../constants/animation');
var coordinates = require('../utils/').coordinates;
var parseProperty = require('./schema').parseProperty;
var registerElement = require('./a-register-element').registerElement;
var TWEEN = require('tween.js');
var utils = require('../utils/');

var DEFAULTS = constants.defaults;
var DIRECTIONS = constants.directions;
var EASING_FUNCTIONS = constants.easingFunctions;
var FILLS = constants.fills;
var REPEATS = constants.repeats;
var isCoordinate = coordinates.isCoordinate;

/**
 * Animation element that applies Tween animation to parent element (entity).
 * Takes after the Web Animations spec.
 *
 * @member {number} count - Decrementing counter for how many cycles of animations left to
 *         run.
 * @member {Element} el - Entity which the animation is modifying.
 * @member initialValue - Value before animation started. Used to restore state.
 * @member {bool} isRunning - Whether animation is currently running.
 * @member {function} partialSetAttribute -
 *   setAttribute function that is agnostic to whether we are setting an attribute value
 *   or a component property value. The el and the attribute names are bundled with
 *   the function.
 * @member {object} tween - tween.js object.
 */
module.exports.AAnimation = registerElement('a-animation', {
  prototype: Object.create(ANode.prototype, {
    createdCallback: {
      value: function () {
        this.bindMethods();
        this.isRunning = false;
        this.partialSetAttribute = function () { /* no-op */ };
        this.tween = null;
      }
    },

    attachedCallback: {
      value: function () {
        var self = this;
        var el = self.el = self.parentNode;

        if (el.isNode) {
          if (el.hasLoaded) {
            init();
          } else {
            el.addEventListener('loaded', init.bind(self));
          }
        } else {
          // To handle elements that are not yet `<a-entity>`s (e.g., templates).
          el.addEventListener('nodeready', init.bind(self));
        }

        function init () {
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

    detachedCallback: {
      value: function () {
        if (!this.isRunning) { return; }
        this.stop();
      }
    },

    /**
     * Builds a Tween object to handle animations.
     * Uses tween.js's from, to, delay, easing, repeat, onUpdate, and onComplete.
     * Note: tween.js takes objects for its `from` and `to` values.
     *
     * @returns {object}
     */
    getTween: {
      value: function () {
        var self = this;
        var data = self.data;
        var el = self.el;
        var animationValues;
        var attribute = data.attribute;
        var begin = parseInt(data.begin, 10);
        var currentValue = getComputedAttributeFor(el, attribute);
        var direction = self.getDirection(data.direction);
        var easing = EASING_FUNCTIONS[data.easing];
        var fill = data.fill;
        var from;
        var repeat = data.repeat === REPEATS.indefinite ? Infinity : 0;
        var to;
        var toTemp;
        var yoyo = false;

        animationValues = getAnimationValues(el, attribute, data.from || self.initialValue, data.to, currentValue);
        from = animationValues.from;
        to = animationValues.to;
        self.partialSetAttribute = animationValues.partialSetAttribute;

        if (self.count === undefined) {
          self.count = repeat === Infinity ? 0 : parseInt(data.repeat, 10);
        }

        if (isNaN(begin)) { begin = 0; }

        // Store initial state.
        self.initialValue = self.initialValue || cloneValue(currentValue);

        // Handle indefinite + forwards + alternate yoyo edge-case (#405).
        if (repeat === Infinity && fill === FILLS.forwards &&
            [DIRECTIONS.alternate,
             DIRECTIONS.alternateReverse].indexOf(data.direction) !== -1) {
          yoyo = true;
        }

        // If reversing, swap from and to.
        if (direction === DIRECTIONS.reverse) {
          toTemp = to;
          to = cloneValue(from);
          from = cloneValue(toTemp);
        }

        // If fill is backwards or both, start animation at the specified from.
        if ([FILLS.backwards, FILLS.both].indexOf(fill) !== -1) {
          self.partialSetAttribute(from);
        }

        // Create Tween.
        return new TWEEN.Tween(cloneValue(from))
          .to(to, data.dur)
          .delay(begin)
          .easing(easing)
          .repeat(repeat)
          .yoyo(yoyo)
          .onUpdate(function () {
            self.partialSetAttribute(this);
          })
          .onComplete(self.onCompleted.bind(self));
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
        var data = this.data;
        this.isRunning = false;
        if ([FILLS.backwards, FILLS.none].indexOf(data.fill) !== -1) {
          this.partialSetAttribute(this.initialValue);
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
        if (this.isRunning || !this.el.isPlaying) { return; }
        this.tween = this.getTween();
        this.isRunning = true;
        this.tween.start();
        this.emit('animationstart');
      },
      writable: true
    },

    stop: {
      value: function () {
        var tween = this.tween;
        if (!tween) { return; }
        tween.stop();
        this.isRunning = false;
        if ([FILLS.backwards, FILLS.none].indexOf(this.data.fill) !== -1) {
          this.partialSetAttribute(this.initialValue);
        }
        this.emit('animationstop');
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
        var self = this;
        utils.splitString(evts).forEach(function (evt) {
          el.addEventListener(evt, self.start);
        });
        // If "begin" is an event name, wait. If it is a delay or not defined, start.
        if (!isNaN(evts)) { el.addEventListener('play', this.start); }
        el.addEventListener('pause', this.stop);
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

function cloneValue (val) {
  return utils.extend({}, val);
}

/**
 * Deduces different animation values based on whether we are:
 *   - animating an inner attribute of a component.
 *   - animating a coordinate component.
 *   - animating a boolean.
 *   - animating a number.
 *
 * @param {Element} el
 * @param {string} attribute - Tells what to animate based on whether it is dot-separated.
 * @param {string} dataFrom - Data `from` value.
 * @param {string} dataTo - Data `to` value.
 * @param currentValue
 * @returns {object}
 *   Object with keys [from, to, partialSetAttribute].
 *     `from` and `to`
 *        Objects where key is attribute being animated and value is value.
 *     `partialSetAttribute`
 *        Closured-function that tells tween how to update the component.
 */
function getAnimationValues (el, attribute, dataFrom, dataTo, currentValue) {
  var attributeSplit = attribute.split('.');
  var schema;
  var component;
  var componentPropName;
  var componentName;
  var from = {};
  var partialSetAttribute;
  var to = {};

  if (attributeSplit.length === 2) {
    getForComponentAttribute();
  } else if (dataTo && isCoordinate(dataTo)) {
    getForCoordinateComponent();
  } else if (['true', 'false'].indexOf(dataTo) !== -1) {
    getForBoolean();
  } else {
    getForNumber();
  }
  return {
    from: from,
    partialSetAttribute: partialSetAttribute,
    to: to
  };

  /**
   * Animating a component that has multiple attributes (e.g., geometry.width).
   */
  function getForComponentAttribute () {
    componentName = attributeSplit[0];
    componentPropName = attributeSplit[1];
    component = el.components[componentName];
    if (!component) {
      el.setAttribute(componentName, '');
      component = el.components[componentName];
    }
    schema = component.schema;
    if (dataFrom === undefined) {  // dataFrom can be 0.
      from[attribute] = getComputedAttributeFor(el, attribute);
    } else {
      from[attribute] = dataFrom;
    }
    from[attribute] = parseProperty(from[attribute], schema[componentPropName]);
    to[attribute] = parseProperty(dataTo, schema[componentPropName]);
    partialSetAttribute = function (value) {
      if (!(attribute in value)) { return; }
      el.setAttribute(componentName, componentPropName, value[attribute]);
    };
  }

  /**
   * Animating a component that is an XYZ coordinate (e.g., position).
   * Will be tweening {x, y, z} all at once.
   */
  function getForCoordinateComponent () {
    from = dataFrom ? coordinates.parse(dataFrom) : currentValue;
    to = coordinates.parse(dataTo);
    partialSetAttribute = function (value) {
      el.setAttribute(attribute, value);
    };
  }

  /**
   * Animation a boolean (e.g., visible).
   * Have to convert from boolean to an integer (0 is false, > 0 is true) for tween.
   */
  function getForBoolean () {
    if (dataFrom === undefined) {
      from[attribute] = false;
    } else {
      from[attribute] = strToBool(dataFrom);
    }
    from[attribute] = boolToNum(from[attribute]);
    to[attribute] = boolToNum(strToBool(dataTo));
    partialSetAttribute = function (value) {
      el.setAttribute(attribute, !!value[attribute]);
    };
  }

  /**
   * Animating a numbered attribute (e.g., opacity).
   */
  function getForNumber () {
    if (dataFrom === undefined) {  // dataFrom can be 0.
      from[attribute] = parseFloat(el.getAttribute(attribute));
    } else {
      from[attribute] = parseFloat(dataFrom);
    }
    to[attribute] = parseFloat(dataTo);
    partialSetAttribute = function (value) {
      el.setAttribute(attribute, value[attribute]);
    };
  }
}
module.exports.getAnimationValues = getAnimationValues;

/**
 * Converts string to bool.
 *
 * @param {string} str - `true` or `false`.
 * @returns {bool}
 */
function strToBool (str) {
  if (str === 'true') { return true; }
  return false;
}

/**
 * Converts boolean to number.
 *
 * @param {bool}
 * @returns {number}
 */
function boolToNum (bool) {
  return bool ? 1 : 0;
}

/**
 * A mapping of attribute to handle component attributes and singular attributes
 *
 * @param {object} element to look up attribute on
 * @param {string} attr dot notation or singular 'color' or 'material.color'
 * @returns {object|string|number} resulting value of type of component property.
 */
function getComputedAttributeFor (el, attribute) {
  var attributeSplit = attribute.split('.');
  if (attributeSplit.length === 1) {
    return el.getComputedAttribute(attribute);
  } else if (el.getComputedAttribute(attributeSplit[0])) {
    return el.getComputedAttribute(attributeSplit[0])[attributeSplit[1]];
  } else if (el.getComputedAttribute(attributeSplit[1])) {
    return el.getComputedAttribute(attributeSplit[1]);
  }
}
