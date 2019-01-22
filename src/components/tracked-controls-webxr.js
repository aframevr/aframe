var controllerUtils = require('../utils/tracked-controls');
var registerComponent = require('../core/component').registerComponent;

module.exports.Component = registerComponent('tracked-controls-webxr', {
  schema: {
    hand: {type: 'string', default: ''}
  },

  init: function () {
    this.addSessionEventListeners = this.addSessionEventListeners.bind(this);
    this.updateController = this.updateController.bind(this);
    this.emitButtonUpEvent = this.emitButtonUpEvent.bind(this);
    this.emitButtonDownEvent = this.emitButtonDownEvent.bind(this);
    this.buttonEventDetails = {id: 'trigger', state: {pressed: false}};
  },

  play: function () {
    var sceneEl = this.el.sceneEl;
    this.updateController();
    this.addSessionEventListeners();
    sceneEl.addEventListener('enter-vr', this.addSessionEventListeners);
    sceneEl.addEventListener('controllersupdated', this.updateController);
  },

  pause: function () {
    var sceneEl = this.el.sceneEl;
    this.removeSessionEventListeners();
    sceneEl.removeEventListener('enter-vr', this.addSessionEventListeners);
    sceneEl.removeEventListener('controllersupdated', this.updateController);
  },

  addSessionEventListeners: function () {
    var sceneEl = this.el.sceneEl;
    if (!sceneEl.xrSession) { return; }
    sceneEl.xrSession.addEventListener('selectstart', this.emitButtonDownEvent);
    sceneEl.xrSession.addEventListener('selectend', this.emitButtonUpEvent);
  },

  removeSessionEventListeners: function () {
    var sceneEl = this.el.sceneEl;
    if (!sceneEl.xrSession) { return; }
    sceneEl.xrSession.addEventListener('selectstart', this.emitButtonDownEvent);
    sceneEl.xrSession.addEventListener('selectend', this.emitButtonUpEvent);
  },

  emitButtonDownEvent: function (evt) {
    if (!this.controller || evt.inputSource.handedness !== this.data.hand) { return; }
    this.buttonEventDetails.state.pressed = true;
    this.el.emit('buttondown', this.buttonEventDetails);
    this.el.emit('buttonchanged', this.buttonEventDetails);
    this.el.emit('triggerdown');
  },

  emitButtonUpEvent: function (evt) {
    if (!this.controller || evt.inputSource.handedness !== this.data.hand) { return; }
    this.buttonEventDetails.state.pressed = false;
    this.el.emit('buttonup', this.buttonEventDetails);
    this.el.emit('buttonchanged', this.buttonEventDetails);
    this.el.emit('triggerup');
  },

  /**
   * Handle update controller match criteria (such as `id`, `idPrefix`, `hand`, `controller`)
   */
  updateController: function () {
    this.controller = controllerUtils.findMatchingControllerWebXR(
      this.system.controllers,
      this.data.hand
    );
    // Legacy handle to the controller for old components.
    this.el.components['tracked-controls'].controller = this.controller;

    if (this.data.autoHide) { this.el.object3D.visible = !!this.controller; }
  },

  tick: function () {
    var pose;
    var sceneEl = this.el.sceneEl;
    var object3D = this.el.object3D;
    if (!this.controller || !sceneEl.frame) { return; }
    pose = sceneEl.frame.getInputPose(this.controller, sceneEl.frameOfReference);
    if (!pose) { return; }
    object3D.matrix.elements = pose.targetRay.transformMatrix;
    object3D.matrix.decompose(object3D.position, object3D.rotation, object3D.scale);
  }
});
