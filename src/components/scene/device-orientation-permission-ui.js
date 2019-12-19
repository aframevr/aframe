/* global DeviceOrientationEvent  */
var registerComponent = require('../../core/component').registerComponent;
var utils = require('../../utils/');
var bind = utils.bind;

var constants = require('../../constants/');

var MODAL_CLASS = 'a-modal';
var DIALOG_CLASS = 'a-dialog';
var DIALOG_TEXT_CLASS = 'a-dialog-text';
var DIALOG_TEXT_CONTAINER_CLASS = 'a-dialog-text-container';
var DIALOG_BUTTONS_CONTAINER_CLASS = 'a-dialog-buttons-container';
var DIALOG_BUTTON_CLASS = 'a-dialog-button';
var DIALOG_ALLOW_BUTTON_CLASS = 'a-dialog-allow-button';
var DIALOG_DENY_BUTTON_CLASS = 'a-dialog-deny-button';
var DIALOG_OK_BUTTON_CLASS = 'a-dialog-ok-button';

/**
 * UI for enabling device motion permission
 */
module.exports.Component = registerComponent('device-orientation-permission-ui', {
  schema: {enabled: {default: true}},

  init: function () {
    var self = this;

    if (!this.data.enabled) { return; }

    // Show alert on iPad if Safari is on desktop mode.
    if (utils.device.isMobileDeviceRequestingDesktopSite()) { this.showMobileDesktopModeAlert(); }

    // Browser doesn't support or doesn't require permission to DeviceOrientationEvent API.
    if (typeof DeviceOrientationEvent === 'undefined' || !DeviceOrientationEvent.requestPermission) {
      this.permissionGranted = true;
      return;
    }

    this.onDeviceMotionDialogAllowClicked = bind(this.onDeviceMotionDialogAllowClicked, this);
    this.onDeviceMotionDialogDenyClicked = bind(this.onDeviceMotionDialogDenyClicked, this);
    // Show dialog only if permission has not yet been granted.
    DeviceOrientationEvent.requestPermission().catch(function () {
      self.devicePermissionDialogEl = createPermissionDialog(
        'This immersive website requires access to your device motion sensors',
        self.onDeviceMotionDialogAllowClicked,
        self.onDeviceMotionDialogDenyClicked);
      self.el.appendChild(self.devicePermissionDialogEl);
    }).then(function () {
      self.el.emit('deviceorientationpermissiongranted');
      self.permissionGranted = true;
    });
  },

  remove: function () {
    // This removes the modal screen
    if (this.devicePermissionDialogEl) { this.el.removeChild(this.devicePermissionDialogEl); }
  },

  onDeviceMotionDialogDenyClicked: function () {
    this.remove();
  },

  showMobileDesktopModeAlert: function () {
    var self = this;
    var safariIpadAlertEl = createAlertDialog(
      'Request the mobile version of this site to enjoy it in immersive mode',
      function () { self.el.removeChild(safariIpadAlertEl); });
    this.el.appendChild(safariIpadAlertEl);
  },

  /**
   * Enable device motion permission when clicked.
   */
  onDeviceMotionDialogAllowClicked: function () {
    var self = this;
    this.el.emit('deviceorientationpermissionrequested');
    DeviceOrientationEvent.requestPermission().then(function (response) {
      if (response === 'granted') {
        self.el.emit('deviceorientationpermissiongranted');
        self.permissionGranted = true;
      } else {
        self.el.emit('deviceorientationpermissionrejected');
      }
      self.remove();
    }).catch(console.error);
  }
});

/**
 * Create a modal dialog that request users permission to access the Device Motion API.
 *
 * @param {function} onAllowClicked - click event handler
 * @returns {Element} Wrapper <div>.
 */
function createPermissionDialog (text, onAllowClicked, onDenyClicked) {
  var buttonsContainer;
  var denyButton;
  var acceptButton;

  buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add(DIALOG_BUTTONS_CONTAINER_CLASS);

  // Buttons
  denyButton = document.createElement('button');
  denyButton.classList.add(DIALOG_BUTTON_CLASS, DIALOG_DENY_BUTTON_CLASS);
  denyButton.setAttribute(constants.AFRAME_INJECTED, '');
  denyButton.innerHTML = 'Deny';
  buttonsContainer.appendChild(denyButton);

  acceptButton = document.createElement('button');
  acceptButton.classList.add(DIALOG_BUTTON_CLASS, DIALOG_ALLOW_BUTTON_CLASS);
  acceptButton.setAttribute(constants.AFRAME_INJECTED, '');
  acceptButton.innerHTML = 'Allow';
  buttonsContainer.appendChild(acceptButton);

  // Ask for sensor events to be used
  acceptButton.addEventListener('click', function (evt) {
    evt.stopPropagation();
    onAllowClicked();
  });

  denyButton.addEventListener('click', function (evt) {
    evt.stopPropagation();
    onDenyClicked();
  });

  return createDialog(text, buttonsContainer);
}

function createAlertDialog (text, onOkClicked) {
  var buttonsContainer;
  var okButton;

  buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add(DIALOG_BUTTONS_CONTAINER_CLASS);

  // Buttons
  okButton = document.createElement('button');
  okButton.classList.add(DIALOG_BUTTON_CLASS, DIALOG_OK_BUTTON_CLASS);
  okButton.setAttribute(constants.AFRAME_INJECTED, '');
  okButton.innerHTML = 'Ok';
  buttonsContainer.appendChild(okButton);

  // Ask for sensor events to be used
  okButton.addEventListener('click', function (evt) {
    evt.stopPropagation();
    onOkClicked();
  });

  return createDialog(text, buttonsContainer);
}

function createDialog (text, buttonsContainerEl) {
  var modalContainer;
  var dialog;
  var dialogTextContainer;
  var dialogText;

  modalContainer = document.createElement('div');
  modalContainer.classList.add(MODAL_CLASS);
  modalContainer.setAttribute(constants.AFRAME_INJECTED, '');

  dialog = document.createElement('div');
  dialog.className = DIALOG_CLASS;
  dialog.setAttribute(constants.AFRAME_INJECTED, '');
  modalContainer.appendChild(dialog);

  dialogTextContainer = document.createElement('div');
  dialogTextContainer.classList.add(DIALOG_TEXT_CONTAINER_CLASS);
  dialog.appendChild(dialogTextContainer);

  dialogText = document.createElement('div');
  dialogText.classList.add(DIALOG_TEXT_CLASS);
  dialogText.innerHTML = text;
  dialogTextContainer.appendChild(dialogText);

  dialog.appendChild(buttonsContainerEl);

  return modalContainer;
}
