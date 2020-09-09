/* global THREE, XRRigidTransform, XRHand */
var registerComponent = require('../core/component').registerComponent;
var bind = require('../utils/bind');

var trackedControlsUtils = require('../utils/tracked-controls');
var checkControllerPresentAndSetup = trackedControlsUtils.checkControllerPresentAndSetup;

var JOINTS_NUMBER = 25;

var LEFT_HAND_MODEL_URL = 'https://cdn.aframe.io/controllers/oculus-hands/unity/left.glb';
var RIGHT_HAND_MODEL_URL = 'https://cdn.aframe.io/controllers/oculus-hands/unity/right.glb';

var BONE_PREFIX = {
  left: 'b_l_',
  right: 'b_r_'
};

var BONE_MAPPING = [
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
    for (var i = 0; i < this.jointEls.length; ++i) {
      this.jointEls[i].object3D.visible = true;
    }
  },

  removeEventListeners: function () {
    this.el.removeEventListener('model-loaded', this.onModelLoaded);
    for (var i = 0; i < this.jointEls.length; ++i) {
      this.jointEls[i].object3D.visible = false;
    }
  },

  init: function () {
    var sceneEl = this.el.sceneEl;
    var webXROptionalAttributes = sceneEl.getAttribute('webxr').optionalFeatures;
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
    var self = this;
    var xrSession = this.el.sceneEl.xrSession;
    this.referenceSpace = undefined;
    if (!xrSession) { return; }
    var referenceSpaceType = self.el.sceneEl.systems.webxr.sessionReferenceSpaceType;
    xrSession.requestReferenceSpace(referenceSpaceType).then(function (referenceSpace) {
      self.referenceSpace = referenceSpace.getOffsetReferenceSpace(new XRRigidTransform({x: 0, y: 1.5, z: 0}));
    }).catch(function (error) {
      self.el.sceneEl.systems.webxr.warnIfFeatureNotRequested(referenceSpaceType, 'tracked-controls-webxr uses reference space ' + referenceSpaceType);
      throw error;
    });
  },

  checkIfControllerPresent: function () {
    var data = this.data;
    var hand = data.hand ? data.hand : undefined;
    checkControllerPresentAndSetup(
      this, '',
      {hand: hand, iterateControllerProfiles: true, handTracking: true});
  },

  play: function () {
    this.checkIfControllerPresent();
    this.addControllersUpdateListener();
  },

  tick: function () {
    var sceneEl = this.el.sceneEl;
    var controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
    var frame = sceneEl.frame;
    var trackedControlsWebXR = this.el.components['tracked-controls-webxr'];
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
    var controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
    var referenceSpace = this.referenceSpace;
    if (!controller || !this.mesh || !referenceSpace) { return; }
    this.mesh.visible = false;
    for (var i = 0; i < controller.hand.length; i++) {
      var bone;
      var jointPose;
      var jointTransform;
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
    var bones = this.bones;
    for (var i = 0; i < bones.length; i++) {
      if (bones[i].name === name) { return bones[i]; }
    }
    return null;
  },

  updateHandDotsModel: function () {
    var frame = this.el.sceneEl.frame;
    var controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
    var trackedControlsWebXR = this.el.components['tracked-controls-webxr'];
    var referenceSpace = trackedControlsWebXR.system.referenceSpace;
    for (var i = 0; i < this.jointEls.length; ++i) {
      var jointEl = this.jointEls[i];
      jointEl.object3D.visible = !!controller.hand[i];
      if (controller.hand[i]) {
        var object3D = jointEl.object3D;
        var pose = frame.getJointPose(controller.hand[i], referenceSpace);
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
    var thumbTipPosition = new THREE.Vector3();
    return function () {
      var frame = this.el.sceneEl.frame;
      var indexTipPosition = this.indexTipPosition;
      var controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
      var trackedControlsWebXR = this.el.components['tracked-controls-webxr'];
      var referenceSpace = this.referenceSpace || trackedControlsWebXR.system.referenceSpace;
      if (!controller.hand[XRHand.INDEX_PHALANX_TIP] ||
          !controller.hand[XRHand.THUMB_PHALANX_TIP]) { return; }
      var indexTipPose = frame.getJointPose(controller.hand[XRHand.INDEX_PHALANX_TIP], referenceSpace);
      var thumbTipPose = frame.getJointPose(controller.hand[XRHand.THUMB_PHALANX_TIP], referenceSpace);

      if (!indexTipPose || !thumbTipPose) { return; }

      thumbTipPosition.copy(thumbTipPose.transform.position);
      indexTipPosition.copy(indexTipPose.transform.position);

      var distance = indexTipPosition.distanceTo(thumbTipPosition);

      if (distance < 0.01 && this.isPinched === false) {
        this.isPinched = true;
        this.pinchEventDetail.position.copy(indexTipPose.transform.position);
        this.pinchEventDetail.position.y += 1.5;
        this.el.emit('pinchstarted', this.pinchEventDetail);
      }

      if (distance > 0.03 && this.isPinched === true) {
        this.isPinched = false;
        this.pinchEventDetail.position.copy(indexTipPose.transform.position);
        this.pinchEventDetail.position.y += 1.5;
        this.el.emit('pinchended', this.pinchEventDetail);
      }

      if (this.isPinched) {
        this.pinchEventDetail.position.copy(indexTipPose.transform.position);
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
    var el = this.el;
    var data = this.data;
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
    var controller;
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
    for (var i = 0; i < JOINTS_NUMBER; ++i) {
      var jointEl = this.jointEl = document.createElement('a-entity');
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
    var modelURL = this.data.hand === 'left' ? LEFT_HAND_MODEL_URL : RIGHT_HAND_MODEL_URL;
    this.el.setAttribute('gltf-model', modelURL);
  },

  onModelLoaded: function () {
    var mesh = this.mesh = this.el.getObject3D('mesh').children[0];
    var skinnedMesh = this.skinnedMesh = mesh.children[24];
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

