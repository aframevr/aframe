/* globals AFRAME THREE */
AFRAME.registerComponent('brush', {
  schema: {
    color: {type: 'color', default: '#ef2d5e'},
    size: {default: 0.01, min: 0.001, max: 0.3},
    enabled: {default: true},
    hand: {default: 'left'}
  },

  init: function () {
    var data = this.data;
    var el = this.el;
    this.color = new THREE.Color(data.color);
    this.painting = false;
    this.stroke = null;
    this.buttonsDown = 0;

    this.onButtonDown = this.onButtonDown.bind(this);
    el.addEventListener('buttondown', this.onButtonDown);
    el.addEventListener('touchstart', this.onButtonDown);

    this.onButtonUp = this.onButtonUp.bind(this);
    el.addEventListener('buttonup', this.onButtonUp);
    el.addEventListener('touchend', this.onButtonUp);

    this.onControllerConnected = this.onControllerConnected.bind(this);
    el.addEventListener('controllerconnected', this.onControllerConnected);

    this.el.setAttribute('oculus-touch-controls', {hand: this.data.hand});
    this.el.setAttribute('logitech-mx-ink-controls', {hand: this.data.hand});
  },

  onControllerConnected: function (evt) {
    this.hand = evt.target.getAttribute(evt.detail.name).hand;
    this.controllerName = evt.detail.name;
  },

  onButtonDown: function () {
    if (!this.data.enabled) { return; }
    this.buttonsDown++;
    this.startNewStroke();
    this.painting = true;
  },

  onButtonUp: function () {
    if (!this.data.enabled) { return; }
    this.buttonsDown--;
    if (this.buttonDown > 0) { return; }
    if (!this.painting) { return; }
    this.stroke = null;
    this.painting = false;
  },

  tick: (function () {
    var position = new THREE.Vector3();
    var rotation = new THREE.Quaternion();
    var scale = new THREE.Vector3();

    return function tick (time, delta) {
      if (!this.painting || !this.stroke) { return; }
      this.el.object3D.matrixWorld.decompose(position, rotation, scale);
      var pointerPosition = this.getPointerPosition(position, rotation);
      this.stroke.addPoint(position, rotation, pointerPosition);
    };
  })(),

  startNewStroke: function () {
    this.stroke = this.system.addNewStroke(this.color, this.data.size);
  },

  getPointerPosition: (function () {
    var pointerPosition = new THREE.Vector3();
    var pointerOffset = new THREE.Vector3();
    var controllerOffset = {
      'oculus-touch-controls': {
        left: new THREE.Vector3(0, -0.025, -0.04),
        right: new THREE.Vector3(0, -0.025, -0.04)
      },
      'logitech-mx-ink-controls': {
        left: new THREE.Vector3(0, -0.065, -0.07),
        right: new THREE.Vector3(0, -0.065, -0.07)
      }
    };

    return function getPointerPosition (position, orientation) {
      if (!this.controllerName) { return position; }
      var offsets = controllerOffset[this.controllerName];
      pointerOffset.copy(offsets[this.hand]);
      pointerOffset.applyQuaternion(orientation);
      pointerPosition.copy(position).add(pointerOffset);
      return pointerPosition;
    };
  })()
});
