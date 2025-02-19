/* global XRHand */
import * as THREE from 'three';
import { registerComponent } from '../core/component.js';
import { AEntity } from '../core/a-entity.js';
import { checkControllerPresentAndSetup } from '../utils/tracked-controls.js';
import { AFRAME_CDN_ROOT } from '../constants/index.js';

var LEFT_HAND_MODEL_URL = AFRAME_CDN_ROOT + 'controllers/oculus-hands/v4/left.glb';
var RIGHT_HAND_MODEL_URL = AFRAME_CDN_ROOT + 'controllers/oculus-hands/v4/right.glb';

var JOINTS = [
  'wrist',
  'thumb-metacarpal',
  'thumb-phalanx-proximal',
  'thumb-phalanx-distal',
  'thumb-tip',
  'index-finger-metacarpal',
  'index-finger-phalanx-proximal',
  'index-finger-phalanx-intermediate',
  'index-finger-phalanx-distal',
  'index-finger-tip',
  'middle-finger-metacarpal',
  'middle-finger-phalanx-proximal',
  'middle-finger-phalanx-intermediate',
  'middle-finger-phalanx-distal',
  'middle-finger-tip',
  'ring-finger-metacarpal',
  'ring-finger-phalanx-proximal',
  'ring-finger-phalanx-intermediate',
  'ring-finger-phalanx-distal',
  'ring-finger-tip',
  'pinky-finger-metacarpal',
  'pinky-finger-phalanx-proximal',
  'pinky-finger-phalanx-intermediate',
  'pinky-finger-phalanx-distal',
  'pinky-finger-tip'
];

var WRIST_INDEX = 0;
var THUMB_TIP_INDEX = 4;
var INDEX_TIP_INDEX = 9;

var PINCH_START_DISTANCE = 0.015;
var PINCH_END_DISTANCE = 0.02;

/**
 * Controls for hand tracking
 */
export var Component = registerComponent('hand-tracking-controls', {
  schema: {
    hand: {default: 'right', oneOf: ['left', 'right']},
    modelStyle: {default: 'mesh', oneOf: ['dots', 'mesh']},
    modelColor: {default: 'white'},
    modelOpacity: {default: 1.0}
  },

  after: ['tracked-controls'],

  bindMethods: function () {
    this.onControllersUpdate = this.onControllersUpdate.bind(this);
    this.checkIfControllerPresent = this.checkIfControllerPresent.bind(this);
    this.removeControllersUpdateListener = this.removeControllersUpdateListener.bind(this);
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
    var webxrData = sceneEl.getAttribute('webxr');
    var optionalFeaturesArray = webxrData.optionalFeatures;
    if (optionalFeaturesArray.indexOf('hand-tracking') === -1) {
      optionalFeaturesArray.push('hand-tracking');
      sceneEl.setAttribute('webxr', webxrData);
    }

    this.wristObject3D = new THREE.Object3D();
    this.el.sceneEl.object3D.add(this.wristObject3D);

    this.onModelLoaded = this.onModelLoaded.bind(this);
    this.onChildAttached = this.onChildAttached.bind(this);
    this.jointEls = [];
    this.controllerPresent = false;
    this.isPinched = false;
    this.pinchEventDetail = {
      position: new THREE.Vector3(),
      wristRotation: new THREE.Quaternion()
    };
    this.indexTipPosition = new THREE.Vector3();

    this.hasPoses = false;
    this.jointPoses = new Float32Array(16 * JOINTS.length);
    this.jointRadii = new Float32Array(JOINTS.length);

    this.bindMethods();

    this.updateReferenceSpace = this.updateReferenceSpace.bind(this);
    this.el.sceneEl.addEventListener('enter-vr', this.updateReferenceSpace);
    this.el.sceneEl.addEventListener('exit-vr', this.updateReferenceSpace);
    this.el.addEventListener('child-attached', this.onChildAttached);

    this.wristObject3D.visible = false;
  },

  onChildAttached: function (evt) {
    this.addChildEntity(evt.detail.el);
  },

  update: function () {
    this.updateModelMaterial();
  },

  updateModelMaterial: function () {
    var jointEls = this.jointEls;
    var skinnedMesh = this.skinnedMesh;
    var transparent = !(this.data.modelOpacity === 1.0);
    if (skinnedMesh) {
      this.skinnedMesh.material.color.set(this.data.modelColor);
      this.skinnedMesh.material.transparent = transparent;
      this.skinnedMesh.material.opacity = this.data.modelOpacity;
    }

    for (var i = 0; i < jointEls.length; i++) {
      jointEls[i].setAttribute('material', {
        color: this.data.modelColor,
        transparent: transparent,
        opacity: this.data.modelOpacity
      });
    }
  },

  updateReferenceSpace: function () {
    var self = this;
    var xrSession = this.el.sceneEl.xrSession;
    this.referenceSpace = undefined;
    if (!xrSession) { return; }
    var referenceSpaceType = self.el.sceneEl.systems.webxr.sessionReferenceSpaceType;
    xrSession.requestReferenceSpace(referenceSpaceType).then(function (referenceSpace) {
      self.referenceSpace = referenceSpace;
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
    var trackedControlsWebXR = this.el.components['tracked-controls'];
    var referenceSpace = this.referenceSpace;
    if (!controller || !frame || !referenceSpace || !trackedControlsWebXR) { return; }
    this.hasPoses = false;
    if (controller.hand) {
      this.el.object3D.position.set(0, 0, 0);
      this.el.object3D.rotation.set(0, 0, 0);

      this.hasPoses = frame.fillPoses(controller.hand.values(), referenceSpace, this.jointPoses) &&
        frame.fillJointRadii(controller.hand.values(), this.jointRadii);

      this.updateHandModel();
      this.detectGesture();
      this.updateWristObject();
    }
  },

  updateWristObject: (function () {
    var jointPose = new THREE.Matrix4();
    return function () {
      var wristObject3D = this.wristObject3D;
      if (!wristObject3D || !this.hasPoses) { return; }
      jointPose.fromArray(this.jointPoses, WRIST_INDEX * 16);
      wristObject3D.position.setFromMatrixPosition(jointPose);
      wristObject3D.quaternion.setFromRotationMatrix(jointPose);
    };
  })(),

  updateHandModel: function () {
    this.wristObject3D.visible = true;
    this.el.object3D.visible = true;

    if (this.data.modelStyle === 'dots') {
      this.updateHandDotsModel();
    }

    if (this.data.modelStyle === 'mesh') {
      this.updateHandMeshModel();
    }
  },

  getBone: function (name) {
    var bones = this.bones;
    for (var i = 0; i < bones.length; i++) {
      if (bones[i].name === name) { return bones[i]; }
    }
    return null;
  },

  updateHandMeshModel: (function () {
    var jointPose = new THREE.Matrix4();
    return function () {
      var i = 0;
      var jointPoses = this.jointPoses;
      var controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
      if (!controller || !this.mesh) { return; }
      this.mesh.visible = false;
      if (!this.hasPoses) { return; }
      for (var inputjoint of controller.hand.values()) {
        var bone = this.getBone(inputjoint.jointName);
        if (bone != null) {
          this.mesh.visible = true;
          jointPose.fromArray(jointPoses, i * 16);
          bone.position.setFromMatrixPosition(jointPose);
          bone.quaternion.setFromRotationMatrix(jointPose);
        }
        i++;
      }
    };
  })(),

  updateHandDotsModel: function () {
    var jointPoses = this.jointPoses;
    var jointRadii = this.jointRadii;
    var controller = this.el.components['tracked-controls'] && this.el.components['tracked-controls'].controller;
    var jointEl;
    var object3D;

    for (var i = 0; i < controller.hand.size; i++) {
      jointEl = this.jointEls[i];
      object3D = jointEl.object3D;
      jointEl.object3D.visible = this.hasPoses;
      if (!this.hasPoses) { continue; }
      object3D.matrix.fromArray(jointPoses, i * 16);
      object3D.matrix.decompose(object3D.position, object3D.rotation, object3D.scale);
      jointEl.setAttribute('scale', {x: jointRadii[i], y: jointRadii[i], z: jointRadii[i]});
    }
  },

  detectGesture: function () {
    this.detectPinch();
  },

  detectPinch: (function () {
    var thumbTipPosition = new THREE.Vector3();
    var jointPose = new THREE.Matrix4();
    return function () {
      var indexTipPosition = this.indexTipPosition;
      var pinchEventDetail = this.pinchEventDetail;
      if (!this.hasPoses) { return; }

      thumbTipPosition.setFromMatrixPosition(jointPose.fromArray(this.jointPoses, THUMB_TIP_INDEX * 16));
      indexTipPosition.setFromMatrixPosition(jointPose.fromArray(this.jointPoses, INDEX_TIP_INDEX * 16));
      pinchEventDetail.wristRotation.setFromRotationMatrix(jointPose.fromArray(this.jointPoses, WRIST_INDEX * 16));

      var distance = indexTipPosition.distanceTo(thumbTipPosition);

      if (distance < PINCH_START_DISTANCE && this.isPinched === false) {
        this.isPinched = true;
        pinchEventDetail.position.copy(indexTipPosition).add(thumbTipPosition).multiplyScalar(0.5);
        this.el.emit('pinchstarted', pinchEventDetail);
      }

      if (distance > PINCH_END_DISTANCE && this.isPinched === true) {
        this.isPinched = false;
        pinchEventDetail.position.copy(indexTipPosition).add(thumbTipPosition).multiplyScalar(0.5);
        this.el.emit('pinchended', pinchEventDetail);
      }

      if (this.isPinched) {
        pinchEventDetail.position.copy(indexTipPosition).add(thumbTipPosition).multiplyScalar(0.5);
        this.el.emit('pinchmoved', pinchEventDetail);
      }
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
      id: '',
      hand: data.hand,
      iterateControllerProfiles: true,
      handTrackingEnabled: true
    });

    if (this.mesh) {
      if (this.mesh !== el.getObject3D('mesh')) {
        el.setObject3D('mesh', this.mesh);
      }
      return;
    }
    this.initDefaultModel();
  },

  addControllersUpdateListener: function () {
    this.el.sceneEl.addEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  removeControllersUpdateListener: function () {
    this.el.sceneEl.removeEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  onControllersUpdate: function () {
    var el = this.el;
    var controller;
    this.checkIfControllerPresent();
    controller = el.components['tracked-controls'] && el.components['tracked-controls'].controller;
    if (!this.mesh) { return; }
    if (controller && controller.hand && (controller.hand instanceof XRHand)) {
      el.setObject3D('mesh', this.mesh);
    }
  },

  initDefaultModel: function () {
    var data = this.data;
    if (data.modelStyle === 'dots') {
      this.initDotsModel();
    }

    if (data.modelStyle === 'mesh') {
      this.initMeshHandModel();
    }

    this.el.object3D.visible = true;
    this.wristObject3D.visible = true;
  },

  initDotsModel: function () {
    // Add models just once.
    if (this.jointEls.length !== 0) { return; }
    for (var i = 0; i < JOINTS.length; ++i) {
      var jointEl = this.jointEl = document.createElement('a-entity');
      jointEl.setAttribute('geometry', {
        primitive: 'sphere',
        radius: 1.0
      });
      jointEl.object3D.visible = false;
      this.el.appendChild(jointEl);
      this.jointEls.push(jointEl);
    }
    this.updateModelMaterial();
  },

  initMeshHandModel: function () {
    var modelURL = this.data.hand === 'left' ? LEFT_HAND_MODEL_URL : RIGHT_HAND_MODEL_URL;
    this.el.setAttribute('gltf-model', modelURL);
  },

  onModelLoaded: function () {
    var mesh = this.mesh = this.el.getObject3D('mesh').children[0];
    var skinnedMesh = this.skinnedMesh = mesh.getObjectByProperty('type', 'SkinnedMesh');
    if (!this.skinnedMesh) { return; }
    this.bones = skinnedMesh.skeleton.bones;
    this.el.removeObject3D('mesh');
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    skinnedMesh.frustumCulled = false;
    skinnedMesh.material = new THREE.MeshStandardMaterial();
    this.updateModelMaterial();
    this.setupChildrenEntities();
    this.el.setObject3D('mesh', mesh);
  },

  setupChildrenEntities: function () {
    var childrenEls = this.el.children;
    for (var i = 0; i < childrenEls.length; ++i) {
      if (!(childrenEls[i] instanceof AEntity)) { continue; }
      this.addChildEntity(childrenEls[i]);
    }
  },

  addChildEntity: function (childEl) {
    if (!(childEl instanceof AEntity)) { return; }
    this.wristObject3D.add(childEl.object3D);
  }
});
