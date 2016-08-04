var registerComponent = require('../core/component').registerComponent;

var LEFT_HAND_MODEL_URL = 'https://cdn.aframe.io/controllers/hands/leftHand.json';
var RIGHT_HAND_MODEL_URL = 'https://cdn.aframe.io/controllers/hands/rightHand.json';

/**
*
* Hand Controls component
* Handle events coming from the vive-controls
* Translate button events to hand related actions:
* gripclose, gripopen, thumbup, thumbdown, pointup, pointdown
* Load a hand model with gestures that are applied based
* on the button pressed.
*
* @property {left/right} Hand mapping
*/
module.exports.Component = registerComponent('hand-controls', {
  schema: {default: 'left'},

  init: function () {
    var self = this;
    this.onGripDown = function () { self.handleButton('grip', 'down'); };
    this.onGripUp = function () { self.handleButton('grip', 'up'); };
    this.onTrackpadDown = function () { self.handleButton('trackpad', 'down'); };
    this.onTrackpadUp = function () { self.handleButton('trackpad', 'up'); };
    this.onTriggerDown = function () { self.handleButton('trigger', 'down'); };
    this.onTriggerUp = function () { self.handleButton('trigger', 'up'); };
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
    el.addEventListener('triggerdown', this.onTriggerDown);
    el.addEventListener('triggerup', this.onTriggerUp);
  },

  removeEventListeners: function () {
    var el = this.el;
    el.removeEventListener('gripdown', this.onGripDown);
    el.removeEventListener('gripup', this.onGripUp);
    el.removeEventListener('trackpaddown', this.onTrackpadDown);
    el.removeEventListener('trackpadup', this.onTrackpadUp);
    el.removeEventListener('triggerdown', this.onTriggerDown);
    el.removeEventListener('triggerup', this.onTriggerUp);
  },

  update: function () {
    var el = this.el;
    var hand = this.data;
    var modelUrl;
    if (hand === 'left') {
      modelUrl = 'url(' + LEFT_HAND_MODEL_URL + ')';
    } else {
      modelUrl = 'url(' + RIGHT_HAND_MODEL_URL + ')';
    }
    el.setAttribute('vive-controls', {hand: hand, model: false});
    el.setAttribute('blend-character-model', modelUrl);
  },

 /** Play the model animations based on the pressed button and kind of event.
   *
   * @param {string} button the name of the button
   * @param {string} evt the event associated to the button
   */
  handleButton: function (button, evt) {
    var el = this.el;
    var isPressed = evt === 'down';
    switch (button) {
      case 'trackpad':
        if (isPressed === this.trackpadPressed) { return; }
        this.trackpadPressed = isPressed;
        this.playAnimation('thumb', !isPressed);
        evt = isPressed ? 'thumbup' : 'thumbdown';
        el.emit(evt);
        break;
      case 'trigger':
        if (isPressed === this.triggerPressed) { return; }
        this.triggerPressed = isPressed;
        this.playAnimation('pointing', !isPressed);
        evt = isPressed ? 'pointup' : 'pointdown';
        el.emit(evt);
        break;
      case 'grip':
        if (isPressed === this.gripPressed) { return; }
        this.gripPressed = isPressed;
        this.playAnimation('close', !isPressed);
        evt = isPressed ? 'gripclose' : 'gripopen';
        el.emit(evt);
        break;
    }
  },

  /**
  * Play the hand animations based on button state.
  *
  * @param {string} animation - the name of the animation.
  * @param {string} reverse - It the animation has to play in reverse.
  */
  playAnimation: function (animation, reverse) {
    var animationActive = this.animationActive;
    var timeScale = 1;
    var mesh = this.el.getObject3D('mesh');
    if (!mesh) { return; }

    // determine direction of the animation.
    if (reverse) { timeScale = -1; }

    // stop current animation.
    if (animationActive) { mesh.play(animationActive, 0); }

    // play new animation.
    mesh.mixer.clipAction(animation).loop = 2200;
    mesh.mixer.clipAction(animation).clampWhenFinished = true;
    mesh.mixer.clipAction(animation).timeScale = timeScale;
    mesh.play(animation, 1);
    this.animationActive = animation;
  }
});
