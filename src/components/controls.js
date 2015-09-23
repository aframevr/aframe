var cssParser = require('parse-css');
var THREE = require('../../lib/three');

// To avoid recalculation at every mouse movement tick
var PI_2 = Math.PI / 2;

module.exports.parseControls = function (str) {
  var attrs;
  var templateStr = this.template && this.template.getAttribute('controls');
  if (templateStr) {
    attrs = cssParser.parseAListOfDeclarations(templateStr);
    this.parseAttributes(attrs);
  }
  if (!str) { return; }
  attrs = cssParser.parseAListOfDeclarations(str);
  this.parseAttributes(attrs);
};

module.exports.parseAttributes = function (attrs) {
  var self = this;
  attrs.forEach(assignAttr);
  function assignAttr (attr) {
    self[attr.name] = attr.value[1].value;
  }
};

module.exports.updateControls = function (str) {
  if (!this.controls) {
    this.setupControls();
    this.controls = true;
  }
  this.parseControls(str);
};

module.exports.setupControls = function () {
  var scene = this.sceneEl;
  this.prevTime = Date.now();
  // The canvas where the scene is painted
  this.canvasEl = document.querySelector('vr-scene').canvas;

  // To keep track of the pressed keys
  this.keys = {};
  this.mouseDown = false;

  this.acceleration = 65;
  this.velocity = new THREE.Vector3();

  this.pitchObject = new THREE.Object3D();
  this.yawObject = new THREE.Object3D();
  this.yawObject.position.y = 10;
  this.yawObject.add(this.pitchObject);

  scene.addBehavior(this);

  this.attachMouseKeyboardListeners();
};

module.exports.update = function () {
  var velocity = this.velocity;
  var pitchObject = this.pitchObject;
  var yawObject = this.yawObject;
  var time = window.performance.now();
  var delta = (time - this.prevTime) / 1000;
  var keys = this.keys;
  var acceleration = this.acceleration;
  var movementVector;
  this.prevTime = time;

  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  var position = this.getAttribute('position', {x: 0, y: 0, z: 0});
  var rotation = this.getAttribute('rotation', {x: 0, y: 0, z: 0});
  var rotZ = rotation.z;

  if (this.locomotion === 'true') {
    if (keys[65]) { // Left
      velocity.x -= acceleration * delta;
    }
    if (keys[87]) { // Up
      velocity.z -= acceleration * delta;
    }
    if (keys[68]) { // Right
      velocity.x += acceleration * delta;
    }
    if (keys[83]) { // Down
      velocity.z += acceleration * delta;
    }
  }

  if (keys[90]) { // Z
    this.reset();
  }

  movementVector = this.getMovementVector(delta);

  this.setAttribute('position', {
    x: position.x + movementVector.x,
    y: position.y,
    z: position.z + movementVector.z
  });

  this.setAttribute('rotation', {
    x: THREE.Math.radToDeg(pitchObject.rotation.x),
    y: THREE.Math.radToDeg(yawObject.rotation.y),
    z: rotZ
  });
};

module.exports.attachMouseKeyboardListeners = function () {
  var canvasEl = this.canvasEl;

  // Keyboard events
  window.addEventListener('keydown', this.onKeyDown.bind(this), false);
  window.addEventListener('keyup', this.onKeyUp.bind(this), false);

  // Mouse Events
  canvasEl.addEventListener('mousedown', this.onMouseDown.bind(this), true);
  canvasEl.addEventListener('mouseup', this.onMouseUp.bind(this), true);
  canvasEl.addEventListener('mousemove', this.onMouseMove.bind(this), true);
};

module.exports.onMouseMove = function (event) {
  var pitchObject = this.pitchObject;
  var yawObject = this.yawObject;
  var mouseDown = this.mouseDown;
  var mouseLook = this.mouselook === 'true';

  if (!mouseDown || !mouseLook) { return; }

  var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

  yawObject.rotation.y -= movementX * 0.002;
  pitchObject.rotation.x -= movementY * 0.002;
  pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
};

module.exports.onMouseDown = function (event) {
  this.mouseDown = true;
  this.lastMouseX = event.clientX;
  this.lastMouseY = event.clientY;
};

module.exports.onMouseUp = function () {
  this.mouseDown = false;
};

module.exports.onKeyDown = function (event) {
  this.keys[event.keyCode] = true;
};

module.exports.onKeyUp = function (event) {
  this.keys[event.keyCode] = false;
};

module.exports.getMovementVector = function (delta) {
  var velocity = this.velocity;
  var direction = new THREE.Vector3(velocity.x * delta, 0, velocity.z * delta);
  var rotation = new THREE.Euler(0, 0, 0, 'YXZ');
  var pitchObject = this.pitchObject;
  var yawObject = this.yawObject;
  rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);
  return direction.applyEuler(rotation);
};
