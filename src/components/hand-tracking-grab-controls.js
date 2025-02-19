import { registerComponent } from '../core/component.js';
import * as THREE from 'three';

registerComponent('hand-tracking-grab-controls', {
  schema: {
    hand: {default: 'right', oneOf: ['left', 'right']},
    color: {type: 'color', default: 'white'},
    hoverColor: {type: 'color', default: '#538df1'},
    hoverEnabled: {default: false}
  },

  init: function () {
    var el = this.el;
    var data = this.data;
    var trackedObject3DVariable;

    if (data.hand === 'right') {
      trackedObject3DVariable = 'components.hand-tracking-controls.bones.3';
    } else {
      trackedObject3DVariable = 'components.hand-tracking-controls.bones.21';
    }

    el.setAttribute('hand-tracking-controls', {hand: data.hand});
    el.setAttribute('obb-collider', {trackedObject3D: trackedObject3DVariable, size: 0.04});

    this.auxMatrix = new THREE.Matrix4();

    this.onCollisionStarted = this.onCollisionStarted.bind(this);
    this.el.addEventListener('obbcollisionstarted', this.onCollisionStarted);

    this.onCollisionEnded = this.onCollisionEnded.bind(this);
    this.el.addEventListener('obbcollisionended', this.onCollisionEnded);

    this.onPinchStarted = this.onPinchStarted.bind(this);
    this.el.addEventListener('pinchstarted', this.onPinchStarted);

    this.onPinchEnded = this.onPinchEnded.bind(this);
    this.el.addEventListener('pinchended', this.onPinchEnded);
  },

  transferEntityOwnership: function () {
    var grabbingElComponent;
    var grabbingEls = this.el.sceneEl.querySelectorAll('[hand-tracking-grab-controls]');
    for (var i = 0; i < grabbingEls.length; ++i) {
      grabbingElComponent = grabbingEls[i].components['hand-tracking-grab-controls'];
      if (grabbingElComponent === this) { continue; }
      if (this.grabbedEl && this.grabbedEl === grabbingElComponent.grabbedEl) {
        grabbingElComponent.releaseGrabbedEntity();
      }
    }
    return false;
  },

  onCollisionStarted: function (evt) {
    var withEl = evt.detail.withEl;
    if (this.collidedEl) { return; }
    if (!withEl.getAttribute('grabbable')) { return; }
    this.collidedEl = withEl;
    this.grabbingObject3D = evt.detail.trackedObject3D;
    if (this.data.hoverEnabled) {
      this.el.setAttribute('hand-tracking-controls', 'modelColor', this.data.hoverColor);
    }
  },

  onCollisionEnded: function () {
    this.collidedEl = undefined;
    if (this.grabbedEl) { return; }
    this.grabbingObject3D = undefined;
    if (this.data.hoverEnabled) {
      this.el.setAttribute('hand-tracking-controls', 'modelColor', this.data.color);
    }
  },

  onPinchStarted: function (evt) {
    if (!this.collidedEl) { return; }
    this.grabbedEl = this.collidedEl;
    this.transferEntityOwnership();
    this.grab();
  },

  onPinchEnded: function () {
    this.releaseGrabbedEntity();
  },

  releaseGrabbedEntity: function () {
    var grabbedEl = this.grabbedEl;
    if (!grabbedEl) { return; }

    var child = grabbedEl.object3D;
    var parent = child.parent;
    var newParent = this.originalParent;

    child.applyMatrix4(parent.matrixWorld);
    child.applyMatrix4(this.auxMatrix.copy(newParent.matrixWorld).invert());
    parent.remove(child);
    newParent.add(child);

    this.el.emit('grabended', {grabbedEl: grabbedEl});
    this.grabbedEl = undefined;
    this.originalParent = undefined;
  },

  grab: function () {
    var grabbedEl = this.grabbedEl;
    var child = grabbedEl.object3D;
    var parent = child.parent;
    this.originalParent = parent;
    var newParent = this.el.components['hand-tracking-controls'].wristObject3D;

    child.applyMatrix4(parent.matrixWorld);
    child.applyMatrix4(this.auxMatrix.copy(newParent.matrixWorld).invert());
    parent.remove(child);
    newParent.add(child);

    this.el.emit('grabstarted', {grabbedEl: grabbedEl});
  }
});
