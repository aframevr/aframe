/* global AFRAME, THREE */
AFRAME.registerComponent('model-controls', {
  init: function () {
    this.modelEl = document.querySelector('#model');
    this.cameraRigEl = document.querySelector('#cameraRig');
    this.laserHitPanelEl = document.querySelector('#laserHitPanel');
    this.titleEl = document.querySelector('#title');
    this.leftHandEl = document.querySelector('#leftHand');
    this.rightHandEl = document.querySelector('#rightHand');

    this.onModelLoaded = this.onModelLoaded.bind(this);

    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);

    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this.onThumbstickMoved = this.onThumbstickMoved.bind(this);

    this.onEnterVR = this.onEnterVR.bind(this);
    this.onExitVR = this.onExitVR.bind(this);

    this.onMouseDownLaserHitPanel = this.onMouseDownLaserHitPanel.bind(this);
    this.onMouseUpLaserHitPanel = this.onMouseUpLaserHitPanel.bind(this);

    this.onOrientationChange = this.onOrientationChange.bind(this);
    this.onSliderChanged = this.onSliderChanged.bind(this);

    // Disable context menu on canvas when pressing mouse right button;
    this.el.sceneEl.canvas.oncontextmenu = function (evt) { evt.preventDefault(); };

    window.addEventListener('orientationchange', this.onOrientationChange);

    this.laserHitPanelEl.addEventListener('mousedown', this.onMouseDownLaserHitPanel);
    this.laserHitPanelEl.addEventListener('mouseup', this.onMouseUpLaserHitPanel);

    this.leftHandEl.addEventListener('thumbstickmoved', this.onThumbstickMoved);
    this.rightHandEl.addEventListener('thumbstickmoved', this.onThumbstickMoved);

    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mousedown', this.onMouseDown);

    document.addEventListener('touchend', this.onTouchEnd);
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('wheel', this.onMouseWheel);

    this.el.sceneEl.addEventListener('enter-vr', this.onEnterVR);
    this.el.sceneEl.addEventListener('exit-vr', this.onExitVR);

    this.modelEl.addEventListener('model-loaded', this.onModelLoaded);

    if (AFRAME.utils.device.isLandscape()) { this.modelEl.object3D.position.z += 1; }
  },

  onThumbstickMoved: function (evt) {
    var modelScale = this.modelScale || this.el.object3D.scale.x;
    modelScale -= evt.detail.y / 20;
    modelScale = Math.min(Math.max(0.8, modelScale), 1.5);
    this.el.object3D.scale.set(modelScale, modelScale, modelScale);
    this.modelScale = modelScale;
  },

  onMouseWheel: function (evt) {
    var modelScale = this.modelScale || this.el.object3D.scale.x;
    modelScale -= evt.deltaY / 100;
    modelScale = Math.min(Math.max(0.8, modelScale), 1.5);
    // Clamp scale.
    this.el.object3D.scale.set(modelScale, modelScale, modelScale);
    this.modelScale = modelScale;
  },

  onMouseDownLaserHitPanel: function (evt) {
    var cursorEl = evt.detail.cursorEl;
    var intersection = cursorEl.components.raycaster.getIntersection(this.laserHitPanelEl);
    if (!intersection) { return; }
    cursorEl.setAttribute('raycaster', 'lineColor', 'white');
    this.activeHandEl = cursorEl;
    this.oldHandX = undefined;
    this.oldHandY = undefined;
  },

  onMouseUpLaserHitPanel: function (evt) {
    var cursorEl = evt.detail.cursorEl;
    if (cursorEl === this.leftHandEl) { this.leftHandPressed = false; }
    if (cursorEl === this.rightHandEl) { this.rightHandPressed = false; }
    cursorEl.setAttribute('raycaster', 'lineColor', 'white');
    if (this.activeHandEl === cursorEl) { this.activeHandEl = undefined; }
  },

  onOrientationChange: function () {
    if (AFRAME.utils.device.isLandscape()) {
      this.modelEl.object3D.position.z += 1;
    } else {
      this.modelEl.object3D.position.z -= 1;
    }
  },

  tick: function () {
    var el = this.el;
    var intersection;
    var intersectionPosition;
    var laserHitPanelEl = this.laserHitPanelEl;
    var activeHandEl = this.activeHandEl;
    if (!this.el.sceneEl.is('vr-mode')) { return; }
    if (!activeHandEl) { return; }
    intersection = activeHandEl.components.raycaster.getIntersection(laserHitPanelEl);
    if (!intersection) {
      activeHandEl.setAttribute('raycaster', 'lineColor', 'white');
      return;
    }
    activeHandEl.setAttribute('raycaster', 'lineColor', '#007AFF');
    intersectionPosition = intersection.point;
    this.oldHandX = this.oldHandX || intersectionPosition.x;
    this.oldHandY = this.oldHandY || intersectionPosition.y;

    el.object3D.rotation.y -= (this.oldHandX - intersectionPosition.x) / 4;
    el.object3D.rotation.x += (this.oldHandY - intersectionPosition.y) / 4;

    this.oldHandX = intersectionPosition.x;
    this.oldHandY = intersectionPosition.y;
  },

  onEnterVR: function () {
    var cameraRigEl = this.cameraRigEl;

    this.cameraRigPosition = cameraRigEl.object3D.position.clone();
    this.cameraRigRotation = cameraRigEl.object3D.rotation.clone();

    cameraRigEl.object3D.position.set(0, 0, 0);
    cameraRigEl.object3D.rotation.set(0, 0, 0);
  },

  onExitVR: function () {
    var cameraRigEl = this.cameraRigEl;

    cameraRigEl.object3D.position.copy(this.cameraRigPosition);
    cameraRigEl.object3D.rotation.copy(this.cameraRigRotation);
  },

  onSliderChanged: function (evt) {
    this.el.object3D.rotation.y = evt.detail.value * Math.PI * 2;
  },

  onTouchMove: function (evt) {
    if (evt.touches.length === 1) { this.onSingleTouchMove(evt); }
    if (evt.touches.length === 2) { this.onPinchMove(evt); }
  },

  onSingleTouchMove: function (evt) {
    var dX;
    var dY;
    this.oldClientX = this.oldClientX || evt.touches[0].clientX;
    this.oldClientY = this.oldClientY || evt.touches[0].clientY;

    dX = this.oldClientX - evt.touches[0].clientX;
    dY = this.oldClientY - evt.touches[0].clientY;

    this.el.object3D.rotation.y -= dX / 200;
    this.oldClientX = evt.touches[0].clientX;

    this.el.object3D.rotation.x -= dY / 100;
    this.oldClientY = evt.touches[0].clientY;
  },

  onPinchMove: function (evt) {
    var dX = evt.touches[0].clientX - evt.touches[1].clientX;
    var dY = evt.touches[0].clientY - evt.touches[1].clientY;
    var distance = Math.sqrt(dX * dX + dY * dY);
    var oldDistance = this.oldDistance || distance;
    var distanceDifference = oldDistance - distance;
    var modelScale = this.modelScale || this.el.object3D.scale.x;

    modelScale -= distanceDifference / 500;
    modelScale = Math.min(Math.max(0.8, modelScale), 1.5);
    // Clamp scale.
    this.el.object3D.scale.set(modelScale, modelScale, modelScale);

    this.modelScale = modelScale;
    this.oldDistance = distance;
  },

  onTouchEnd: function (evt) {
    this.oldClientX = undefined;
    this.oldClientY = undefined;
    if (evt.touches.length < 2) { this.oldDistance = undefined; }
  },

  onMouseUp: function (evt) {
    this.leftRightButtonPressed = false;
    if (evt.buttons === undefined || evt.buttons !== 0) { return; }
    this.oldClientX = undefined;
    this.oldClientY = undefined;
  },

  onMouseMove: function (evt) {
    if (this.leftRightButtonPressed) {
      this.dragModel(evt);
    } else {
      this.rotateModel(evt);
    }
  },

  dragModel: function (evt) {
    var dX;
    var dY;
    if (!this.oldClientX) { return; }
    dX = this.oldClientX - evt.clientX;
    dY = this.oldClientY - evt.clientY;
    this.el.object3D.position.y += dY / 200;
    this.el.object3D.position.x -= dX / 200;
    this.oldClientX = evt.clientX;
    this.oldClientY = evt.clientY;
  },

  rotateModel: function (evt) {
    var dX;
    var dY;
    if (!this.oldClientX) { return; }
    dX = this.oldClientX - evt.clientX;
    dY = this.oldClientY - evt.clientY;
    this.el.object3D.rotation.y -= dX / 100;
    this.el.object3D.rotation.x -= dY / 200;

    // Clamp x rotation to [-90,90]
    this.el.object3D.rotation.x = Math.min(Math.max(-Math.PI / 2, this.el.object3D.rotation.x), Math.PI / 2);
    console.log('XXX ' + this.el.object3D.rotation.x);

    this.oldClientX = evt.clientX;
    this.oldClientY = evt.clientY;
  },

  onModelLoaded: function () {
    this.centerAndScaleModel();
  },

  centerAndScaleModel: function () {
    var box;
    var size;
    var center;
    var scale;
    var gltfEl = this.modelEl.querySelector('[gltf-model]');
    var gltfObject = gltfEl.getObject3D('mesh');

    gltfEl.object3D.updateMatrixWorld();
    box = new THREE.Box3().setFromObject(gltfObject);
    size = box.getSize(new THREE.Vector3());

    // Human scale.
    scale = 1.6 / size.z;
    box.expandByScalar(scale);

    gltfEl.object3D.scale.set(scale, scale, scale);
    gltfEl.object3D.updateMatrixWorld();
    box = new THREE.Box3().setFromObject(gltfObject);
    center = box.getCenter(new THREE.Vector3());

    gltfEl.object3D.position.x += (gltfEl.object3D.position.x - center.x);
    gltfEl.object3D.position.y += (gltfEl.object3D.position.y - center.y);
    gltfEl.object3D.position.z += (gltfEl.object3D.position.z - center.z);
  },

  onMouseDown: function (evt) {
    if (evt.buttons) {
      this.leftRightButtonPressed = evt.buttons === 3;
      evt.preventDefault();
    }
    this.oldClientX = evt.clientX;
    this.oldClientY = evt.clientY;
  }
});
