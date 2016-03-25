var registerComponent = require('../../core/component').registerComponent;
var THREE = require('../../lib/three');
var utils = require('../../utils/');

var dummyDolly = new THREE.Object3D();
var controls = new THREE.VRControls(dummyDolly);

var ENTER_VR_CLASS = 'a-enter-vr';
var ENTER_VR_NO_HEADSET = 'data-a-enter-vr-no-headset';
var ENTER_VR_NO_WEBVR = 'data-a-enter-vr-no-webvr';
var ENTER_VR_BTN_CLASS = 'a-enter-vr-button';
var ENTER_VR_MODAL_CLASS = 'a-enter-vr-modal';
var HIDDEN_CLASS = 'a-hidden';
var ORIENTATION_MODAL_CLASS = 'a-orientation-modal';

/**
 * UI for entering VR mode.
 */
module.exports.Component = registerComponent('vr-mode-ui', {
  dependencies: [ 'canvas' ],

  schema: {
    enabled: { default: true }
  },

  init: function () {
    var self = this;
    var scene = this.el;

    this.enterVR = scene.enterVR.bind(scene);
    this.exitVR = scene.exitVR.bind(scene);
    this.insideLoader = false;
    this.enterVREl = null;
    this.orientationModalEl = null;

    // Hide/show VR UI when entering/exiting VR mode.
    scene.addEventListener('enter-vr', this.updateEnterVRInterface.bind(this));
    scene.addEventListener('exit-vr', this.updateEnterVRInterface.bind(this));

    window.addEventListener('message', function (event) {
      if (event.data.type === 'loaderReady') {
        self.insideLoader = true;
        self.remove();
      }
    });

    // Modal that tells the user to change orientation if in portrait.
    window.addEventListener('orientationchange', this.toggleOrientationModalIfNeeded.bind(this));
  },

  update: function () {
    var scene = this.el;

    if (!this.data.enabled || this.insideLoader) { return this.remove(); }
    if (this.enterVREl || this.orientationModalEl) { return; }

    // Add UI if enabled and not already present.
    this.enterVREl = createEnterVR(this.enterVR, scene.isMobile);
    this.el.appendChild(this.enterVREl);

    this.orientationModalEl = createOrientationModal(this.exitVR);
    this.el.appendChild(this.orientationModalEl);

    this.updateEnterVRInterface();
  },

  remove: function () {
    [this.enterVREl, this.orientationModalEl].forEach(function (uiElement) {
      if (uiElement) {
        uiElement.parentNode.removeChild(uiElement);
      }
    });
  },

  updateEnterVRInterface: function () {
    this.toggleEnterVRButtonIfNeeded();
    this.toggleOrientationModalIfNeeded();
  },

  toggleEnterVRButtonIfNeeded: function () {
    if (!this.enterVREl) { return; }
    var scene = this.el;
    if (scene.is('vr-mode')) {
      this.enterVREl.classList.add(HIDDEN_CLASS);
    } else {
      this.enterVREl.classList.remove(HIDDEN_CLASS);
    }
  },

  toggleOrientationModalIfNeeded: function () {
    var scene = this.el;
    if (!this.orientationModalEl || !scene.isMobile) { return; }
    if (!utils.isLandscape() && scene.is('vr-mode')) {
      // Show if in VR mode on portrait.
      this.orientationModalEl.classList.remove(HIDDEN_CLASS);
    } else {
      this.orientationModalEl.classList.add(HIDDEN_CLASS);
    }
  }
});

/**
 * Creates Enter VR flow (button and compatibility modal).
 *
 * Creates a button that when clicked will enter into stereo-rendering mode for VR.
 *
 * For compatibility:
 *   - Mobile always has compatibility via polyfill.
 *   - If desktop browser does not have WebVR excluding polyfill, disable button, show modal.
 *   - If desktop browser has WebVR excluding polyfill but not headset connected,
 *     don't disable button, but show modal.
 *   - If desktop browser has WebVR excluding polyfill and has headset connected, then
 *     then no modal.
 *
 * Structure: <div><modal/><button></div>
 *
 * @returns {Element} Wrapper <div>.
 */
function createEnterVR (enterVRHandler, isMobile) {
  var compatModal;
  var compatModalLink;
  var compatModalText;
  // window.hasNativeWebVRSupport is set in src/index.js.
  var hasWebVR = isMobile || window.hasNativeWebVRSupport;
  var orientation;
  var vrButton;
  var wrapper;

  // Create elements.
  wrapper = document.createElement('div');
  wrapper.classList.add(ENTER_VR_CLASS);
  compatModal = document.createElement('div');
  compatModal.className = ENTER_VR_MODAL_CLASS;
  compatModalText = document.createElement('p');
  compatModalLink = document.createElement('a');
  compatModalLink.setAttribute('href', 'http://mozvr.com/#start');
  compatModalLink.setAttribute('target', '_blank');
  compatModalLink.innerHTML = 'Learn more.';
  vrButton = document.createElement('button');
  vrButton.className = ENTER_VR_BTN_CLASS;
  vrButton.title = 'Enter VR';

  // Insert elements.
  wrapper.appendChild(vrButton);
  if (compatModal) {
    compatModal.appendChild(compatModalText);
    compatModal.appendChild(compatModalLink);
    wrapper.appendChild(compatModal);
  }

  if (!checkHeadsetConnected() && !isMobile) {
    compatModalText.innerHTML = 'Your browser supports WebVR. To enter VR, connect a headset, or use a mobile phone.';
    wrapper.setAttribute(ENTER_VR_NO_HEADSET, '');
  }

  // Handle enter VR flows.
  if (!hasWebVR) {
    compatModalText.innerHTML = 'Your browser does not support WebVR. To enter VR, use a VR-compatible browser or a mobile phone.';
    wrapper.setAttribute(ENTER_VR_NO_WEBVR, '');
  } else {
    vrButton.addEventListener('click', enterVRHandler);
  }
  return wrapper;

  /**
   * Check for headset connection by looking at orientation {0 0 0}.
   */
  function checkHeadsetConnected () {
    controls.update();
    orientation = dummyDolly.quaternion;
    if (orientation._x !== 0 || orientation._y !== 0 || orientation._z !== 0) {
      return true;
    }
  }
}

/**
 * Create a modal that tells mobile users to orient the phone to landscape.
 * Add a close button that if clicked, exits VR and closes the modal.
 */
function createOrientationModal (exitVRHandler) {
  var modal = document.createElement('div');
  modal.className = ORIENTATION_MODAL_CLASS;
  modal.classList.add(HIDDEN_CLASS);

  var exit = document.createElement('button');
  exit.innerHTML = 'Exit VR';

  // Exit VR on close.
  exit.addEventListener('click', exitVRHandler);

  modal.appendChild(exit);

  return modal;
}
