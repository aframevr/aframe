var registerComponent = require('../../core/component').registerComponent;
var utils = require('../../utils/');
var bind = utils.bind;
// const AFrame = require('../../');
var constants = require('../../constants/');
//{AFRAME_INJECTED: 'aframe-injected'} //
var DEVICE_PERMISSION_CLASS = 'a-device-motion-permission';
var DEVICE_PERMISSION_BTN_CLASS = 'a-device-motion-permission-button';
var HIDDEN_CLASS = 'a-hidden';
var ORIENTATION_MODAL_CLASS = 'a-orientation-modal';

/**
 * UI for entering VR mode.
 */
 module.exports.Component = registerComponent('device-motion-permission', {
// AFrame.registerComponent('vr-mode-ui', {
  dependencies: ['canvas'],

  schema: {
    enabled: {default: true},
    enableFunc: {default:{}}
  },

  init: function () {
    var self = this;
    var sceneEl = this.el;
    this.deviceMotionEl = null;
    this.onDeviceMotionClick = bind(this.onDeviceMotionClick, this);
  },

  update: function () {
    var data = this.data;
    var sceneEl = this.el;

    if (!data.enabled || this.insideLoader || utils.getUrlParameter('ui') === 'false') {
      return this.remove();
    }

    if (this.deviceMotionEl) { return; }

    // Add UI if enabled and not already present.
    if (data.deviceMotionButton) {
      // Custom button.
      this.deviceMotionEl = document.querySelector(data.deviceMotionButton);
      this.deviceMotionEl.addEventListener('click', this.onDeviceMotionClick);
    } else {
      this.deviceMotionEl = createDeviceMotionButton(this.onDeviceMotionClick);
      sceneEl.appendChild(this.deviceMotionEl);
    }
  },

  remove: function () {
      if (this.deviceMotionEl && this.deviceMotionEl.parentNode) {
        this.deviceMotionEl.parentNode.removeChild(this.deviceMotionEl);
      }
  },

  /**
   * Enter VR when modal clicked.
   */
  onDeviceMotionClick: function () {
    try {
        if (
          DeviceMotionEvent &&
          typeof DeviceMotionEvent.requestPermission === 'function'
        ){
          DeviceMotionEvent.requestPermission().then(
            response => {
              if (response === 'granted') {
                grantedDeviceMotion(funcArg)
              }else{
                console.log('Device Motion permission not granted.')
              }
            })
            .catch(console.error)
        } else {
          grantedDeviceMotion(funcArg)
        }
      } catch (oops) {
        console.log('Your device and application combination do not support device motion events.')
      }
    },

   grantedDeviceMotion: function(funcArg) {
    window.addEventListener(
      'devicemotion',
      funcArg,
      false
    );
  }
});

/**
 * Create a button that when clicked will enter into stereo-rendering mode for VR.
 *
 * Structure: <div><button></div>
 *
 * @param {function} onClick - click event handler
 * @returns {Element} Wrapper <div>.
 */
function createDeviceMotionButton (onClick) {
  var vrButton;
  var wrapper;

  // Create elements.
  wrapper = document.createElement('div');
  wrapper.classList.add(DEVICE_PERMISSION_CLASS); // DEVICE_PERMISSION_CLASS);
  wrapper.setAttribute(constants.AFRAME_INJECTED, '');
  vrButton = document.createElement('button');
  vrButton.className = DEVICE_PERMISSION_BTN_CLASS; // DEVICE_PERMISSION_BTN_CLASS;
  vrButton.setAttribute('title',
    'We need your permission to access the orientation of your device.');
  vrButton.setAttribute(constants.AFRAME_INJECTED, '');

  // Insert elements.
  wrapper.appendChild(vrButton);
  vrButton.addEventListener('click', function (evt) {
    onClick();
    evt.stopPropagation();
  });
  return wrapper;
}
}
