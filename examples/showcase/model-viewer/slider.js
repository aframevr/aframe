/* global AFRAME, THREE */
AFRAME.registerComponent('slider', {
  schema: {width: {default: 2.0}},

  init: function () {
    this.localPosition = new THREE.Vector3();
    this.onControllerConnected = this.onControllerConnected.bind(this);
    this.onExitVR = this.onExitVR.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);

    this.el.sceneEl.addEventListener('controllerconnected', this.onControllerConnected);
    this.el.sceneEl.addEventListener('exit-vr', this.onExitVR);
  },

  onControllerConnected: function () {
    var trackEl;
    var pickerEl;
    var pickerHitBoxEl;
    var pickerBackPlaneEl;

    this.el.object3D.visible = true;

    if (this.trackEl) { return; }

    trackEl = this.trackEl = document.createElement('a-entity');
    pickerEl = this.pickerEl = document.createElement('a-entity');
    pickerHitBoxEl = this.pickerHitBoxEl = document.createElement('a-entity');
    pickerBackPlaneEl = this.pickerBackPlaneEl = document.createElement('a-entity');

    trackEl.setAttribute('geometry', {
      primitive: 'box',
      height: 0.01,
      width: this.data.width,
      depth: 0.01
    });
    trackEl.setAttribute('material', {color: 'white'});
    this.el.appendChild(trackEl);

    pickerEl.setAttribute('geometry', {
      primitive: 'box',
      width: 0.08,
      height: 0.08,
      depth: 0.08
    });
    pickerEl.setAttribute('material', {color: '#3f3f3f'});
    pickerEl.setAttribute('rotation', {x: 90, y: 0, z: 0});
    pickerEl.classList.add('raycastable');
    this.el.appendChild(pickerEl);

    pickerHitBoxEl.setAttribute('geometry', {
      primitive: 'box',
      width: 0.10,
      height: 0.10,
      depth: 0.10
    });
    pickerHitBoxEl.setAttribute('material', {color: 'red'});
    pickerHitBoxEl.setAttribute('rotation', {x: 90, y: 0, z: 0});
    pickerHitBoxEl.setAttribute('visible', 'false');
    pickerHitBoxEl.classList.add('raycastable');
    this.el.appendChild(pickerHitBoxEl);

    pickerBackPlaneEl.setAttribute('geometry', {
      primitive: 'plane',
      radius: 0.5,
      width: this.data.width * 1.5,
      height: 1
    });
    pickerBackPlaneEl.setAttribute('material', {color: 'red'});
    pickerBackPlaneEl.classList.add('raycastable');
    pickerBackPlaneEl.setAttribute('visible', 'false');
    this.el.appendChild(pickerBackPlaneEl);

    pickerHitBoxEl.addEventListener('mousedown', this.onMouseDown);
    pickerHitBoxEl.addEventListener('mouseup', this.onMouseUp);

    pickerHitBoxEl.addEventListener('mouseenter', this.onMouseEnter);
    pickerHitBoxEl.addEventListener('mouseleave', this.onMouseLeave);
  },

  onExitVR: function () {
    this.el.object3D.visible = false;
  },

  tick: function () {
    var el = this.el;
    var evtDetail = this.evtDetail;
    var handEl = this.handEl;
    var intersectionPosition;
    var localPosition = this.localPosition;
    var halfWidth = this.data.width / 2;
    var pickerEl = this.pickerEl;
    var pickerHitBoxEl = this.pickerHitBoxEl;
    var pickerBackPlaneEl = this.pickerBackPlaneEl;
    var intersection;

    if (!this.el.sceneEl.is('vr-mode') || !handEl) { return; }
    intersection = handEl.components.raycaster.getIntersection(pickerBackPlaneEl);
    if (!intersection) {
      this.handEl = undefined;
      this.pickerEl.setAttribute('material', {color: '#3f3f3f'});
      return;
    }
    intersectionPosition = intersection.point;
    localPosition.copy(intersectionPosition);
    el.object3D.updateMatrixWorld();
    el.object3D.worldToLocal(localPosition);
    if (localPosition.x < -halfWidth || localPosition.x > halfWidth) { return; }
    pickerEl.object3D.position.x = localPosition.x;
    pickerHitBoxEl.object3D.position.x = localPosition.x;
    evtDetail.value = (pickerHitBoxEl.object3D.position.x + halfWidth) / this.data.width;
    this.el.emit('sliderchanged', evtDetail);
  },

  onMouseEnter: function () {
    this.pickerEl.setAttribute('material', {color: '71b8e6'});
  },

  onMouseLeave: function () {
    if (this.handEl) { return; }
    this.pickerEl.setAttribute('material', {color: '#3f3f3f'});
  },

  onMouseDown: function (evt) {
    this.handEl = evt.detail.cursorEl;
    this.pickerEl.setAttribute('material', {color: '#3a50c5'});
  },

  onMouseUp: function () {
    this.handEl = undefined;
    this.pickerEl.setAttribute('material', {color: '#3f3f3f'});
    this.oldPosition = undefined;
  }
});
