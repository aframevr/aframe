/* global THREE, XRRigidTransform, XRHand */
let registerComponent = require('../core/component').registerComponent;
let bind = require('../utils/bind');

let trackedControlsUtils = require('../utils/tracked-controls');
let checkControllerPresentAndSetup = trackedControlsUtils.checkControllerPresentAndSetup;

let JOINTS_NUMBER = 25;

let LEFT_HAND_MODEL_URL = 'https://cdn.aframe.io/controllers/oculus-hands/unity/left.glb';
let RIGHT_HAND_MODEL_URL = 'https://cdn.aframe.io/controllers/oculus-hands/unity/right.glb';

let BONE_PREFIX = {
  left: 'b_l_',
  right: 'b_r_'
};

let BONE_MAPPING = [
  'wrist',
  'thumb1',
  'thumb2',
  'thumb3',
  'thumb_null',
  null,
  'index1',
  'index2',
  'index3',
  'index_null',
  null,
  'middle1',
  'middle2',
  'middle3',
  'middle_null',
  null,
  'ring1',
  'ring2',
  'ring3',
  'ring_null',
  'pinky0',
  'pinky1',
  'pinky2',
  'pinky3',
  'pinky_null'
];

let PINCH_START_DISTANCE = 0.015;
let PINCH_END_DISTANCE = 0.03;
let PINCH_POSITION_INTERPOLATION = 0.5;

/**
 * Controls for hand tracking
 */
module.exports.Component = registerComponent('hand-tracking-controls', {
  schema: {
    hand: {default: 'right', oneOf: ['left', 'right']},
    modelStyle: {default: 'mesh', oneOf: ['dots', 'mesh']},
    modelColor: {default: 'white'}
  },

  bindMethods: function () {
    this.onControllersUpdate = bind(this.onControllersUpdate, this);
    this.checkIfControllerPresent = bind(this.checkIfControllerPresent, this);
    this.removeControllersUpdateListener = bind(this.removeControllersUpdateListener, this);
  },

  addEventListeners: function () {
    this.el.addEventListener('model-loaded', this.onModelLoaded);
    for (let i = 0; i < this.jointEls.length; ++i) {
      this.jointEls[i].object3D.visible = true;
    }
  },

  removeEventListeners: function () {
    this.el.removeEventListener('model-loaded', this.onModelLoaded);
    for (let i = 0; i < this.jointEls.length; ++i) {
      this.jointEls[i].object3D.visible = false;
    }
  },

  init: function () {
    let sceneEl = this.el.sceneEl;
    let webXROptionalAttributes = sceneEl.getAttribute('webxr').optionalFeatures;
    webXROptionalAttributes.push('hand-tracking');
    sceneEl.setAttribute('webxr', {optionalFeatures: webXROptionalAttributes});
    this.onModelLoaded = this.onModelLoaded.bind(this);
    this.jointEls = [];
    this.controllerPresent = false;
    this.isPinched = false;
    this.pinchEventDetail = {position: new THREE.Vector3()};
    this.indexTipPosition = new THREE.Vector3();

    this.bindMethods();

    this.updateReferenceSpace = this.updateReferenceSpace.bind(this);
    this.el.sceneEl.addEventListener('enter-vr', this.updateReferenceSpace);
    this.el.sceneEl.addEventListener('exit-vr', this.updateReferenceSpace);
  },

  updateReferenceSpace: function () {
    let self = this;
    let xrSession = this.el.sceneEl.xrSession;
    this.referenceSpace = undefined;
    if (!xrSession) { return; }
    let referenceSpaceType = self.el.sceneEl.systems.webxr.sessionReferenceSpaceType;
    xrSession.requestReferenceSpace(referenceSpaceType).then(function (referenceSpace) {
      self.referenceSpace = referenceSpace.getOffsetReferenceSpace(new XRRigidTransform({x: 0, y: 1.5, z: 0}));
    }).catch(function (error) {
      self.el.sceneEl.systems.webxr.warnIfFeatureNotRequested(referenceSpaceType, 'tracked-controls-webxr uses reference space ' + referenceSpaceType);
      throw error;
    });
  },

  checkIfControllerPresent: function () {
    let data = this.data;
    let hand = data.hand ? data.hand : undefined;
    checkControllerPresentAndSetup(
      this, '',
      {hand: hand, iterateControllerProfiles: true, handTracking: true});
  },

  play: function () {
    this.checkIfControllerPresent();
    this.addControllersUpdateListener();
  },

  tick: function () {
    let sceneEl = this.el.sceneEl;
    let controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
    let frame = sceneEl.frame;
    let trackedControlsWebXR = this.el.components['tracked-controls-webxr'];
    if (!controller || !frame || !trackedControlsWebXR) { return; }
    if (controller.hand) {
      this.el.object3D.position.set(0, 0, 0);
      this.el.object3D.rotation.set(0, 0, 0);
      if (frame.getJointPose) { this.updateHandModel(); }
      this.detectGesture();
    }
  },

  updateHandModel: function () {
    if (this.data.modelStyle === 'dots') {
      this.updateHandDotsModel();
    }

    if (this.data.modelStyle === 'mesh') {
      this.updateHandMeshModel();
    }
  },

  updateHandMeshModel: function () {
    let controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
    let referenceSpace = this.referenceSpace;
    if (!controller || !this.mesh || !referenceSpace) { return; }
    this.mesh.visible = false;
    for (let i = 0; i < controller.hand.length; i++) {
      let bone;
      let jointPose;
      let jointTransform;
      if (!controller.hand[i]) { continue; }
      jointPose = this.el.sceneEl.frame.getJointPose(controller.hand[i], referenceSpace);
      if (BONE_MAPPING[i] == null) { continue; }
      bone = this.getBone(BONE_PREFIX[this.data.hand] + BONE_MAPPING[i]);
      if (bone != null && jointPose) {
        jointTransform = jointPose.transform;
        this.mesh.visible = true;
        bone.position.copy(jointTransform.position).multiplyScalar(100);
        bone.quaternion.set(jointTransform.orientation.x, jointTransform.orientation.y, jointTransform.orientation.z, jointTransform.orientation.w);
      }
    }
  },

  getBone: function (name) {
    let bones = this.bones;
    for (let i = 0; i < bones.length; i++) {
      if (bones[i].name === name) { return bones[i]; }
    }
    return null;
  },

  updateHandDotsModel: function () {
    let frame = this.el.sceneEl.frame;
    let controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
    let trackedControlsWebXR = this.el.components['tracked-controls-webxr'];
    let referenceSpace = trackedControlsWebXR.system.referenceSpace;
    for (let i = 0; i < this.jointEls.length; ++i) {
      let jointEl = this.jointEls[i];
      jointEl.object3D.visible = !!controller.hand[i];
      if (controller.hand[i]) {
        let object3D = jointEl.object3D;
        let pose = frame.getJointPose(controller.hand[i], referenceSpace);
        jointEl.object3D.visible = !!pose;
        if (!pose) { continue; }
        object3D.matrix.elements = pose.transform.matrix;
        object3D.matrix.decompose(object3D.position, object3D.rotation, object3D.scale);
        jointEl.setAttribute('scale', {x: pose.radius, y: pose.radius, z: pose.radius});
      }
    }
  },

  detectGesture: function () {
    this.detectPinch();
  },

  detectPinch: (function () {
    let thumbTipPosition = new THREE.Vector3();
    return function () {
      let frame = this.el.sceneEl.frame;
      let indexTipPosition = this.indexTipPosition;
      let controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
      let trackedControlsWebXR = this.el.components['tracked-controls-webxr'];
      let referenceSpace = this.referenceSpace || trackedControlsWebXR.system.referenceSpace;
      if (!controller.hand[XRHand.INDEX_PHALANX_TIP] ||
          !controller.hand[XRHand.THUMB_PHALANX_TIP]) { return; }
      let indexTipPose = frame.getJointPose(controller.hand[XRHand.INDEX_PHALANX_TIP], referenceSpace);
      let thumbTipPose = frame.getJointPose(controller.hand[XRHand.THUMB_PHALANX_TIP], referenceSpace);

      if (!indexTipPose || !thumbTipPose) { return; }

      thumbTipPosition.copy(thumbTipPose.transform.position);
      indexTipPosition.copy(indexTipPose.transform.position);

      let distance = indexTipPosition.distanceTo(thumbTipPosition);

      if (distance < PINCH_START_DISTANCE && this.isPinched === false) {
        this.isPinched = true;
        this.pinchEventDetail.position.copy(indexTipPosition).lerp(thumbTipPosition, PINCH_POSITION_INTERPOLATION);
        this.pinchEventDetail.position.y += 1.5;
        this.el.emit('pinchstarted', this.pinchEventDetail);
      }

      if (distance > PINCH_END_DISTANCE && this.isPinched === true) {
        this.isPinched = false;
        this.pinchEventDetail.position.copy(indexTipPosition).lerp(thumbTipPosition, PINCH_POSITION_INTERPOLATION);
        this.pinchEventDetail.position.y += 1.5;
        this.el.emit('pinchended', this.pinchEventDetail);
      }

      if (this.isPinched) {
        this.pinchEventDetail.position.copy(indexTipPosition).lerp(thumbTipPosition, PINCH_POSITION_INTERPOLATION);
        this.pinchEventDetail.position.y += 1.5;
        this.el.emit('pinchmoved', this.pinchEventDetail);
      }

      indexTipPosition.y += 1.5;
    };
  })(),

  pause: function () {
    this.removeEventListeners();
    this.removeControllersUpdateListener();
  },

  injectTrackedControls: function () {
    let el = this.el;
    let data = this.data;
    el.setAttribute('tracked-controls', {
      hand: data.hand,
      iterateControllerProfiles: true,
      handTrackingEnabled: true
    });
    this.initDefaultModel();
  },

  addControllersUpdateListener: function () {
    this.el.sceneEl.addEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  removeControllersUpdateListener: function () {
    this.el.sceneEl.removeEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  onControllersUpdate: function () {
    let controller;
    this.checkIfControllerPresent();
    controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
    if (!this.el.getObject3D('mesh')) { return; }
    if (!controller || !controller.hand || !controller.hand[0]) {
      this.el.removeObject3D('mesh');
    }
  },

  initDefaultModel: function () {
    if (this.data.modelStyle === 'dots') {
      this.initDotsModel();
    }

    if (this.data.modelStyle === 'mesh') {
      this.initMeshHandModel();
    }
  },

  initDotsModel: function () {
     // Add models just once.
    if (this.jointEls.length !== 0) { return; }
    for (let i = 0; i < JOINTS_NUMBER; ++i) {
      let jointEl = this.jointEl = document.createElement('a-entity');
      jointEl.setAttribute('geometry', {
        primitive: 'sphere',
        radius: 1.0
      });
      jointEl.setAttribute('material', {color: this.data.modelColor});
      jointEl.object3D.visible = false;
      this.el.appendChild(jointEl);
      this.jointEls.push(jointEl);
    }
  },

  initMeshHandModel: function () {
    let modelURL = this.data.hand === 'left' ? LEFT_HAND_MODEL_URL : RIGHT_HAND_MODEL_URL;
    this.el.setAttribute('gltf-model', modelURL);
  },

  onModelLoaded: function () {
    let mesh = this.mesh = this.el.getObject3D('mesh').children[0];
    let skinnedMesh = this.skinnedMesh = mesh.children[24];
    if (!this.skinnedMesh) { return; }
    this.bones = skinnedMesh.skeleton.bones;
    this.el.removeObject3D('mesh');
    mesh.position.set(0, 1.5, 0);
    mesh.rotation.set(0, 0, 0);
    skinnedMesh.frustumCulled = false;
    skinnedMesh.material = new THREE.MeshStandardMaterial({skinning: true, color: this.data.modelColor});
    this.el.setObject3D('mesh', mesh);
  }
});

