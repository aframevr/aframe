/**
 * Animation configuration options for TWEEN.js animations.
 * Used by `<a-animation>`.
 */
var TWEEN = require('tween.js');

var DIRECTIONS = {
  alternate: 'alternate',
  alternateReverse: 'alternate-reverse',
  normal: 'normal',
  reverse: 'reverse'
};

var EASING_FUNCTIONS = {
  'linear': TWEEN.Easing.Linear.None,

  'ease': TWEEN.Easing.Cubic.InOut,
  'ease-in': TWEEN.Easing.Cubic.In,
  'ease-out': TWEEN.Easing.Cubic.Out,
  'ease-in-out': TWEEN.Easing.Cubic.InOut,

  'ease-cubic': TWEEN.Easing.Cubic.In,
  'ease-in-cubic': TWEEN.Easing.Cubic.In,
  'ease-out-cubic': TWEEN.Easing.Cubic.Out,
  'ease-in-out-cubic': TWEEN.Easing.Cubic.InOut,

  'ease-quad': TWEEN.Easing.Quadratic.InOut,
  'ease-in-quad': TWEEN.Easing.Quadratic.In,
  'ease-out-quad': TWEEN.Easing.Quadratic.Out,
  'ease-in-out-quad': TWEEN.Easing.Quadratic.InOut,

  'ease-quart': TWEEN.Easing.Quartic.InOut,
  'ease-in-quart': TWEEN.Easing.Quartic.In,
  'ease-out-quart': TWEEN.Easing.Quartic.Out,
  'ease-in-out-quart': TWEEN.Easing.Quartic.InOut,

  'ease-quint': TWEEN.Easing.Quintic.InOut,
  'ease-in-quint': TWEEN.Easing.Quintic.In,
  'ease-out-quint': TWEEN.Easing.Quintic.Out,
  'ease-in-out-quint': TWEEN.Easing.Quintic.InOut,

  'ease-sine': TWEEN.Easing.Sinusoidal.InOut,
  'ease-in-sine': TWEEN.Easing.Sinusoidal.In,
  'ease-out-sine': TWEEN.Easing.Sinusoidal.Out,
  'ease-in-out-sine': TWEEN.Easing.Sinusoidal.InOut,

  'ease-expo': TWEEN.Easing.Exponential.InOut,
  'ease-in-expo': TWEEN.Easing.Exponential.In,
  'ease-out-expo': TWEEN.Easing.Exponential.Out,
  'ease-in-out-expo': TWEEN.Easing.Exponential.InOut,

  'ease-circ': TWEEN.Easing.Circular.InOut,
  'ease-in-circ': TWEEN.Easing.Circular.In,
  'ease-out-circ': TWEEN.Easing.Circular.Out,
  'ease-in-out-circ': TWEEN.Easing.Circular.InOut,

  'ease-elastic': TWEEN.Easing.Elastic.InOut,
  'ease-in-elastic': TWEEN.Easing.Elastic.In,
  'ease-out-elastic': TWEEN.Easing.Elastic.Out,
  'ease-in-out-elastic': TWEEN.Easing.Elastic.InOut,

  'ease-back': TWEEN.Easing.Back.InOut,
  'ease-in-back': TWEEN.Easing.Back.In,
  'ease-out-back': TWEEN.Easing.Back.Out,
  'ease-in-out-back': TWEEN.Easing.Back.InOut,

  'ease-bounce': TWEEN.Easing.Bounce.InOut,
  'ease-in-bounce': TWEEN.Easing.Bounce.In,
  'ease-out-bounce': TWEEN.Easing.Bounce.Out,
  'ease-in-out-bounce': TWEEN.Easing.Bounce.InOut
};

var FILLS = {
  backwards: 'backwards',
  both: 'both',
  forwards: 'forwards',
  none: 'none'
};

var REPEATS = {
  indefinite: 'indefinite'
};

var DEFAULTS = {
  attribute: 'rotation',
  begin: '',
  end: '',
  delay: 0,
  dur: 1000,
  easing: 'ease',
  direction: DIRECTIONS.normal,
  fill: FILLS.forwards,
  from: undefined,
  repeat: 0,
  to: undefined
};

module.exports.defaults = DEFAULTS;
module.exports.directions = DIRECTIONS;
module.exports.easingFunctions = EASING_FUNCTIONS;
module.exports.fills = FILLS;
module.exports.repeats = REPEATS;
