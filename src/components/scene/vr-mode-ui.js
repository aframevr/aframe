var registerComponent = require('../../core/component').registerComponent;
var constants = require('../../constants/');
var utils = require('../../utils/');
var bind = utils.bind;

var ENTER_VR_CLASS = 'a-enter-vr';
var ENTER_VR_BTN_CLASS = 'a-enter-vr-button';
var HIDDEN_CLASS = 'a-hidden';
var ORIENTATION_MODAL_CLASS = 'a-orientation-modal';

/**
 * UI for entering VR mode.
 */
module.exports.Component = registerComponent('vr-mode-ui', {
  dependencies: ['canvas'],

  schema: {
    enabled: {default: true},
    enterVRButton: {default: ''}
  },

  init: function () {
    var self = this;
    var sceneEl = this.el;

    if (utils.getUrlParameter('ui') === 'false') { return; }

    this.insideLoader = false;
    this.enterVREl = null;
    this.orientationModalEl = null;
    this.bindMethods();

    // Hide/show VR UI when entering/exiting VR mode.
    sceneEl.addEventListener('enter-vr', this.updateEnterVRInterface);
    sceneEl.addEventListener('exit-vr', this.updateEnterVRInterface);

    window.addEventListener('message', function (event) {
      if (event.data.type === 'loaderReady') {
        self.insideLoader = true;
        self.remove();
      }
    });

    // Modal that tells the user to change orientation if in portrait.
    window.addEventListener('orientationchange', this.toggleOrientationModalIfNeeded);
  },

  bindMethods: function () {
    this.onEnterVRButtonClick = bind(this.onEnterVRButtonClick, this);
    this.onModalClick = bind(this.onModalClick, this);
    this.toggleOrientationModalIfNeeded = bind(this.toggleOrientationModalIfNeeded, this);
    this.updateEnterVRInterface = bind(this.updateEnterVRInterface, this);
  },

  /**
   * Exit VR when modal clicked.
   */
  onModalClick: function () {
    this.el.exitVR();
  },

  /**
   * Enter VR when modal clicked.
   */
  onEnterVRButtonClick: function () {
    this.el.enterVR();
  },

  update: function () {
    var data = this.data;
    var sceneEl = this.el;

    if (!data.enabled || this.insideLoader || utils.getUrlParameter('ui') === 'false') {
      return this.remove();
    }
    if (this.enterVREl || this.orientationModalEl) { return; }

    // Add UI if enabled and not already present.
    if (data.enterVRButton) {
      // Custom button.
      this.enterVREl = document.querySelector(data.enterVRButton);
      this.enterVREl.addEventListener('click', this.onEnterVRButtonClick);
    } else {
      this.enterVREl = createEnterVRButton(this.onEnterVRButtonClick);
      sceneEl.appendChild(this.enterVREl);
    }

    this.orientationModalEl = createOrientationModal(this.onModalClick);
    sceneEl.appendChild(this.orientationModalEl);

    this.updateEnterVRInterface();
  },

  remove: function () {
    [this.enterVREl, this.orientationModalEl].forEach(function (uiElement) {
      if (uiElement && uiElement.parentNode) {
        uiElement.parentNode.removeChild(uiElement);
      }
    });
  },

  updateEnterVRInterface: function () {
    this.toggleEnterVRButtonIfNeeded();
    this.toggleOrientationModalIfNeeded();
  },

  toggleEnterVRButtonIfNeeded: function () {
    var sceneEl = this.el;
    if (!this.enterVREl) { return; }
    if (sceneEl.is('vr-mode')) {
      this.enterVREl.classList.add(HIDDEN_CLASS);
    } else {
      this.enterVREl.classList.remove(HIDDEN_CLASS);
    }
  },

  toggleOrientationModalIfNeeded: function () {
    var sceneEl = this.el;
    var orientationModalEl = this.orientationModalEl;
    if (!orientationModalEl || !sceneEl.isMobile) { return; }
    if (!utils.device.isLandscape() && sceneEl.is('vr-mode')) {
      // Show if in VR mode on portrait.
      orientationModalEl.classList.remove(HIDDEN_CLASS);
    } else {
      orientationModalEl.classList.add(HIDDEN_CLASS);
    }
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
function createEnterVRButton (onClick) {
  var vrButton;
  var wrapper;

  // Create elements.
  wrapper = document.createElement('div');
  wrapper.classList.add(ENTER_VR_CLASS);
  wrapper.setAttribute(constants.AFRAME_INJECTED, '');
  vrButton = document.createElement('button');
  vrButton.className = ENTER_VR_BTN_CLASS;
  vrButton.setAttribute('title',
    'Enter VR mode with a headset or fullscreen mode on a desktop. ' +
    'Visit https://webvr.rocks or https://webvr.info for more information.');
  vrButton.setAttribute(constants.AFRAME_INJECTED, '');

  // Insert elements.
  wrapper.appendChild(vrButton);
  vrButton.addEventListener('click', function (evt) {
    onClick();
    evt.stopPropagation();
  });
  return wrapper;
}

/**
 * Creates a modal dialog to request the user to switch to landscape orientation.
 *
 * @param {function} onClick - click event handler
 * @returns {Element} Wrapper <div>.
 */
function createOrientationModal (onClick) {
  var modal = document.createElement('div');
  modal.className = ORIENTATION_MODAL_CLASS;
  modal.classList.add(HIDDEN_CLASS);
  modal.setAttribute(constants.AFRAME_INJECTED, '');

  var exit = document.createElement('button');
  exit.setAttribute(constants.AFRAME_INJECTED, '');
  exit.innerHTML = 'Exit VR';

  // Exit VR on close.
  exit.addEventListener('click', onClick);

  modal.appendChild(exit);

  return modal;
}
