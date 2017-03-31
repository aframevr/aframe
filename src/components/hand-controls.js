/* global THREE */
var registerComponent = require('../core/component').registerComponent;

// Found at https://github.com/aframevr/assets.
var MODEL_URLS = {
  left: 'https://cdn.aframe.io/controllers/oculus-hands/v2/leftHand.json',
  right: 'https://cdn.aframe.io/controllers/oculus-hands/v2/rightHand.json'
};

// Poses.
var ANIMATIONS = {
  open: 'Open',
  // point: grip active, trackpad surface active, trigger inactive.
  point: 'Point',
  // pointThumb: grip active, trigger inactive, trackpad surface inactive.
  pointThumb: 'Point + Thumb',
  // fist: grip active, trigger active, trackpad surface active.
  fist: 'Fist',
  // hold: trigger active, grip inactive.
  hold: 'Hold',
  // thumbUp: grip active, trigger active, trackpad surface inactive.
  thumbUp: 'Thumb Up'
};

// Map animation to public events for the API.
var EVENTS = {};
EVENTS[ANIMATIONS.fist] = 'grip';
EVENTS[ANIMATIONS.thumbUp] = 'pistol';
EVENTS[ANIMATIONS.point] = 'pointing';
EVENTS[ANIMATIONS.thumb] = 'thumb';

/**
 * Hand controls component that abstracts 6DoF controls: oculus-touch-controls, vive-controls.
 * Originally meant to be a sample implementation of applications-specific controls that
 * abstracts multiple types of controllers.
 *
 * Auto-detect appropriate controller.
 * Handle common events coming from the detected vendor-specific controls.
 * Translate button events to semantic hand-related event names:
 *   (gripclose, gripopen, thumbup, thumbdown, pointup, pointdown)
 * Load hand model with gestures that are applied based on the button pressed.
 *
 * @property {string} Hand mapping (`left`, `right`).
 */
module.exports.Component = registerComponent('hand-controls', {
  schema: {default: 'left'},

  init: function () {
    var self = this;
    // Current pose.
    this.gesture = ANIMATIONS.open;
    // Active buttons populated by events provided by oculus-touch-controls and vive-controls.
    this.pressedButtons = {};
    this.touchedButtons = {};

    this.onGripDown = function () { self.handleButton('grip', 'down'); };
    this.onGripUp = function () { self.handleButton('grip', 'up'); };
    this.onTrackpadDown = function () { self.handleButton('trackpad', 'down'); };
    this.onTrackpadUp = function () { self.handleButton('trackpad', 'up'); };
    this.onTrackpadTouchStart = function () { self.handleButton('trackpad', 'touchstart'); };
    this.onTrackpadTouchEnd = function () { self.handleButton('trackpad', 'touchend'); };
    this.onTriggerDown = function () { self.handleButton('trigger', 'down'); };
    this.onTriggerUp = function () { self.handleButton('trigger', 'up'); };
    this.onTriggerTouchStart = function () { self.handleButton('trigger', 'touchstart'); };
    this.onTriggerTouchEnd = function () { self.handleButton('trigger', 'touchend'); };
    this.onGripTouchStart = function () { self.handleButton('grip', 'touchstart'); };
    this.onGripTouchEnd = function () { self.handleButton('grip', 'touchend'); };
    this.onThumbstickDown = function () { self.handleButton('thumbstick', 'down'); };
    this.onThumbstickUp = function () { self.handleButton('thumbstick', 'up'); };
    this.onAorXTouchStart = function () { self.handleButton('AorX', 'touchstart'); };
    this.onAorXTouchEnd = function () { self.handleButton('AorX', 'touchend'); };
    this.onBorYTouchStart = function () { self.handleButton('BorY', 'touchstart'); };
    this.onBorYTouchEnd = function () { self.handleButton('BorY', 'touchend'); };
    this.onSurfaceTouchStart = function () { self.handleButton('surface', 'touchstart'); };
    this.onSurfaceTouchEnd = function () { self.handleButton('surface', 'touchend'); };
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
  },

  addEventListeners: function () {
    var el = this.el;
    el.addEventListener('gripdown', this.onGripDown);
    el.addEventListener('gripup', this.onGripUp);
    el.addEventListener('trackpaddown', this.onTrackpadDown);
    el.addEventListener('trackpadup', this.onTrackpadUp);
    el.addEventListener('trackpadtouchstart', this.onTrackpadTouchStart);
    el.addEventListener('trackpadtouchend', this.onTrackpadTouchEnd);
    el.addEventListener('triggerdown', this.onTriggerDown);
    el.addEventListener('triggerup', this.onTriggerUp);
    el.addEventListener('triggertouchstart', this.onTriggerTouchStart);
    el.addEventListener('triggertouchend', this.onTriggerTouchEnd);
    el.addEventListener('griptouchstart', this.onGripTouchStart);
    el.addEventListener('griptouchend', this.onGripTouchEnd);
    el.addEventListener('thumbstickdown', this.onThumbstickDown);
    el.addEventListener('thumbstickup', this.onThumbstickUp);
    el.addEventListener('abuttontouchstart', this.onAorXTouchStart);
    el.addEventListener('abuttontouchend', this.onAorXTouchEnd);
    el.addEventListener('bbuttontouchstart', this.onBorYTouchStart);
    el.addEventListener('bbuttontouchend', this.onBorYTouchEnd);
    el.addEventListener('xbuttontouchstart', this.onAorXTouchStart);
    el.addEventListener('xbuttontouchend', this.onAorXTouchEnd);
    el.addEventListener('ybuttontouchstart', this.onBorYTouchStart);
    el.addEventListener('ybuttontouchend', this.onBorYTouchEnd);
    el.addEventListener('surfacetouchstart', this.onSurfaceTouchStart);
    el.addEventListener('surfacetouchend', this.onSurfaceTouchEnd);
  },

  removeEventListeners: function () {
    var el = this.el;
    el.removeEventListener('gripdown', this.onGripDown);
    el.removeEventListener('gripup', this.onGripUp);
    el.removeEventListener('trackpaddown', this.onTrackpadDown);
    el.removeEventListener('trackpadup', this.onTrackpadUp);
    el.removeEventListener('trackpadtouchstart', this.onTrackpadTouchStart);
    el.removeEventListener('trackpadtouchend', this.onTrackpadTouchEnd);
    el.removeEventListener('triggerdown', this.onTriggerDown);
    el.removeEventListener('triggerup', this.onTriggerUp);
    el.removeEventListener('triggertouchstart', this.onTriggerTouchStart);
    el.removeEventListener('triggertouchend', this.onTriggerTouchEnd);
    el.removeEventListener('griptouchstart', this.onGripTouchStart);
    el.removeEventListener('griptouchend', this.onGripTouchEnd);
    el.removeEventListener('thumbstickdown', this.onThumbstickDown);
    el.removeEventListener('thumbstickup', this.onThumbstickUp);
    el.removeEventListener('abuttontouchstart', this.onAorXTouchStart);
    el.removeEventListener('abuttontouchend', this.onAorXTouchEnd);
    el.removeEventListener('bbuttontouchstart', this.onBorYTouchStart);
    el.removeEventListener('bbuttontouchend', this.onBorYTouchEnd);
    el.removeEventListener('xbuttontouchstart', this.onAorXTouchStart);
    el.removeEventListener('xbuttontouchend', this.onAorXTouchEnd);
    el.removeEventListener('ybuttontouchstart', this.onBorYTouchStart);
    el.removeEventListener('ybuttontouchend', this.onBorYTouchEnd);
    el.removeEventListener('surfacetouchstart', this.onSurfaceTouchStart);
    el.removeEventListener('surfacetouchend', this.onSurfaceTouchEnd);
  },

  /**
   * Update handler. More like the `init` handler since the only property is the hand, and
   * that won't be changing much.
   */
  update: function () {
    var controlConfiguration;
    var el = this.el;
    var hand = this.data;

    // Get common configuration to abstract Vive and Oculus.
    controlConfiguration = {
      hand: hand,
      model: false,
      rotationOffset: hand === 'left' ? 90 : -90
    };
    el.setAttribute('vive-controls', controlConfiguration);
    el.setAttribute('oculus-touch-controls', controlConfiguration);
    el.setAttribute('daydream-controls', controlConfiguration);
    el.setAttribute('gearvr-controls', controlConfiguration);

    // Set model.
    el.setAttribute('blend-character-model', MODEL_URLS[hand]);
  },

  /**
   * Play model animation, based on which button was pressed and which kind of event.
   *
   * 1. Process buttons.
   * 2. Determine gesture (this.determineGesture()).
   * 3. Animation gesture (this.animationGesture()).
   * 4. Emit gesture events (this.emitGestureEvents()).
   *
   * @param {string} button - Name of the button.
   * @param {string} evt - Type of event for the button (i.e., down/up/touchstart/touchend).
   */
  handleButton: function (button, evt) {
    var lastGesture;
    var isPressed = evt === 'down';
    var isTouched = evt === 'touchstart';

    // Update objects.
    if (evt.indexOf('touch') === 0) {
      // Update touch object.
      if (isTouched === this.touchedButtons[button]) { return; }
      this.touchedButtons[button] = isTouched;
    } else {
      // Update button object.
      if (isPressed === this.pressedButtons[button]) { return; }
      this.pressedButtons[button] = isPressed;
    }

    // Determine the gesture.
    lastGesture = this.gesture;
    this.gesture = this.determineGesture();

    // Same gesture.
    if (this.gesture === lastGesture) { return; }

    // Animate gesture.
    this.animateGesture(this.gesture, lastGesture);

    // Emit events.
    this.emitGestureEvents(this.gesture, lastGesture);
  },

  /**
   * Determine which pose hand should be in considering active and touched buttons.
   */
  determineGesture: function () {
    var gesture;
    var isGripActive = this.pressedButtons['grip'];
    var isSurfaceActive = this.pressedButtons['surface'] || this.touchedButtons['surface'];
    var isTrackpadActive = this.pressedButtons['trackpad'] || this.touchedButtons['trackpad'];
    var isTriggerActive = this.pressedButtons['trigger'] || this.touchedButtons['trigger'];
    var isABXYActive = this.touchedButtons['AorX'] || this.touchedButtons['BorY'];
    var isOculusTouch = isOculusTouchController(this.el.components['tracked-controls']);

    // Works well with Oculus Touch but Vive needs tweaks.
    if (isGripActive) {
      if (!isOculusTouch) {
        gesture = ANIMATIONS.fist;
      } else
      if (isSurfaceActive || isABXYActive || isTrackpadActive) {
        gesture = isTriggerActive ? ANIMATIONS.fist : ANIMATIONS.point;
      } else {
        gesture = isTriggerActive ? ANIMATIONS.thumbUp : ANIMATIONS.pointThumb;
      }
    } else {
      if (isTriggerActive) {
        gesture = isOculusTouch ? ANIMATIONS.hold : ANIMATIONS.fist;
      } else if (!isOculusTouch && isTrackpadActive) {
        gesture = ANIMATIONS.point;
      }
    }

    return gesture;
  },

  /**
   * Play gesture animation.
   *
   * @param {string} gesture - Which pose to animate to. If absent, then animate to open.
   * @param {string} lastGesture - Previous gesture, to reverse back to open if needed.
   */
  animateGesture: function (gesture, lastGesture) {
    if (gesture) {
      this.playAnimation(gesture || ANIMATIONS.open, lastGesture, false);
      return;
    }
    // If no gesture, then reverse the current gesture back to open pose.
    this.playAnimation(lastGesture, lastGesture, true);
  },

  /**
   * Emit `hand-controls`-specific events.
   */
  emitGestureEvents: function (gesture, lastGesture) {
    var el = this.el;
    var eventName;

    if (lastGesture === gesture) { return; }

    // Emit event for lastGesture not inactive.
    eventName = getGestureEventName(lastGesture, false);
    if (eventName) { el.emit(eventName); }

    // Emit event for current gesture now active.
    eventName = getGestureEventName(gesture, true);
    if (eventName) { el.emit(eventName); }
  },

/**
  * Play hand animation based on button state.
  *
  * @param {string} gesture - Name of the animation as specified by the model.
  * @param {string} lastGesture - Previous pose.
  * @param {boolean} reverse - Whether animation should play in reverse.
  */
  playAnimation: function (gesture, lastGesture, reverse) {
    var fromAction;
    var mesh = this.el.getObject3D('mesh');
    var toAction;

    if (!mesh) { return; }

    // Grab clip action.
    toAction = mesh.mixer.clipAction(gesture);
    toAction.clampWhenFinished = true;
    toAction.loop = THREE.PingPong;
    toAction.repetitions = 0;
    toAction.timeScale = reverse ? -1 : 1;

    // No gesture to gesture or gesture to no gesture.
    if (!lastGesture || gesture === lastGesture) {
      // Stop all current animations.
      mesh.stopAll();

      // Play animation.
      mesh.play(gesture, 1);
      return;
    }

    // Animate or crossfade from gesture to gesture.
    fromAction = mesh.mixer.clipAction(lastGesture);
    mesh.mixer.stopAllAction();
    mesh.play(lastGesture, 0.15);
    mesh.play(gesture, 1);
    fromAction.crossFadeTo(toAction, 0.15, true);
  }
});

/**
 * Suffix gestures based on toggle state (e.g., open/close, up/down, start/end).
 *
 * @param {string} gesture
 * @param {boolean} active
 */
function getGestureEventName (gesture, active) {
  var eventName;

  if (!gesture) { return; }

  eventName = EVENTS[gesture];
  if (eventName === 'grip') {
    return eventName + (active ? 'close' : 'open');
  }
  if (eventName === 'point' || eventName === 'thumb') {
    return eventName + (active ? 'up' : 'down');
  }
  if (eventName === 'pointing' || eventName === 'pistol') {
    return eventName + (active ? 'start' : 'end');
  }
  return;
}

function isOculusTouchController (trackedControls) {
  var controllerId = trackedControls && trackedControls.controller &&
                     trackedControls.controller.id;
  return controllerId && controllerId.indexOf('Oculus Touch') === 0;
}
