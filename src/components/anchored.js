/* global XRRigidTransform, localStorage */
import * as THREE from 'three';
import { registerComponent } from '../core/component.js';
import * as utils from '../utils/index.js';
var warn = utils.debug('components:anchored:warn');

/**
 * Anchored component.
 * Feature only available in browsers that implement the WebXR anchors module.
 * Once anchored the entity remains to a fixed position in real-world space.
 * If the anchor is persistent, the anchor positioned remains across sessions or until the browser data is cleared.
 */
export var Component = registerComponent('anchored', {
  schema: {
    persistent: {default: false}
  },

  init: function () {
    var sceneEl = this.el.sceneEl;
    var webxrData = sceneEl.getAttribute('webxr');
    var optionalFeaturesArray = webxrData.optionalFeatures;
    if (optionalFeaturesArray.indexOf('anchors') === -1) {
      optionalFeaturesArray.push('anchors');
      this.el.sceneEl.setAttribute('webxr', webxrData);
    }

    this.auxQuaternion = new THREE.Quaternion();

    this.onEnterVR = this.onEnterVR.bind(this);
    this.el.sceneEl.addEventListener('enter-vr', this.onEnterVR);
  },

  onEnterVR: function () {
    this.anchor = undefined;
    this.requestPersistentAnchorPending = this.data.persistent;
    this.requestAnchorPending = !this.data.persistent;
  },

  tick: function () {
    var sceneEl = this.el.sceneEl;
    var xrManager = sceneEl.renderer.xr;
    var frame;
    var refSpace;
    var pose;
    var object3D = this.el.object3D;

    if ((!sceneEl.is('ar-mode') && !sceneEl.is('vr-mode'))) { return; }
    if (!this.anchor && this.requestPersistentAnchorPending) { this.restorePersistentAnchor(); }
    if (!this.anchor && this.requestAnchorPending) { this.createAnchor(); }
    if (!this.anchor) { return; }

    frame = sceneEl.frame;
    refSpace = xrManager.getReferenceSpace();

    pose = frame.getPose(this.anchor.anchorSpace, refSpace);
    // Apply position and orientation, leave scale as-is (see aframevr/aframe#5630)
    object3D.position.copy(pose.transform.position);
    object3D.quaternion.copy(pose.transform.orientation);
  },

  createAnchor: async function createAnchor (position, quaternion) {
    var sceneEl = this.el.sceneEl;
    var xrManager = sceneEl.renderer.xr;
    var frame;
    var referenceSpace;
    var anchorPose;
    var anchor;
    var object3D = this.el.object3D;

    position = position || object3D.position;
    quaternion = quaternion || this.auxQuaternion.setFromEuler(object3D.rotation);

    if (!anchorsSupported(sceneEl)) {
      warn('This browser doesn\'t support the WebXR anchors module');
      return;
    }

    if (this.anchor) { this.deleteAnchor(); }

    frame = sceneEl.frame;
    referenceSpace = xrManager.getReferenceSpace();
    anchorPose = new XRRigidTransform(
      {
        x: position.x,
        y: position.y,
        z: position.z
      },
      {
        x: quaternion.x,
        y: quaternion.y,
        z: quaternion.z,
        w: quaternion.w
      });

    this.requestAnchorPending = false;
    anchor = await frame.createAnchor(anchorPose, referenceSpace);
    if (this.data.persistent) {
      if (this.el.id) {
        this.persistentHandle = await anchor.requestPersistentHandle();
        localStorage.setItem(this.el.id, this.persistentHandle);
      } else {
        warn('The anchor won\'t be persisted because the entity has no assigned id.');
      }
    }
    sceneEl.object3D.attach(this.el.object3D);
    this.anchor = anchor;
  },

  restorePersistentAnchor: async function restorePersistentAnchor () {
    var xrManager = this.el.sceneEl.renderer.xr;
    var session = xrManager.getSession();
    var persistentAnchors = session.persistentAnchors;
    var storedPersistentHandle;
    this.requestPersistentAnchorPending = false;
    if (!this.el.id) {
      warn('The entity associated to the persistent anchor cannot be retrieved because it doesn\'t have an assigned id.');
      this.requestAnchorPending = true;
      return;
    }
    if (persistentAnchors) {
      storedPersistentHandle = localStorage.getItem(this.el.id);
      for (var i = 0; i < persistentAnchors.length; ++i) {
        if (storedPersistentHandle !== persistentAnchors[i]) { continue; }
        this.anchor = await session.restorePersistentAnchor(persistentAnchors[i]);
        if (this.anchor) { this.persistentHandle = persistentAnchors[i]; }
        break;
      }
      if (!this.anchor) { this.requestAnchorPending = true; }
    } else {
      this.requestPersistentAnchorPending = true;
    }
  },

  deleteAnchor: function () {
    var xrManager;
    var session;
    var anchor = this.anchor;

    if (!anchor) { return; }
    xrManager = this.el.sceneEl.renderer.xr;
    session = xrManager.getSession();

    anchor.delete();
    this.el.sceneEl.object3D.add(this.el.object3D);
    if (this.persistentHandle) { session.deletePersistentAnchor(this.persistentHandle); }
    this.anchor = undefined;
  }
});

function anchorsSupported (sceneEl) {
  var xrManager = sceneEl.renderer.xr;
  var session = xrManager.getSession();
  return (session && session.restorePersistentAnchor);
}
