/* global AFRAME, THREE */
AFRAME.registerComponent('pressable', {
  schema: {
    pressDistance: { default: 0.06 }
  },

  init: function () {
    this.worldPosition = new THREE.Vector3();
    this.handEls = document.querySelectorAll('[hand-tracking-controls]');
    this.pressed = false;
  },

  tick: function () {
    let handEls = this.handEls;
    let handEl;
    let distance;
    for (let i = 0; i < handEls.length; i++) {
      handEl = handEls[i];
      distance = this.calculateFingerDistance(handEl.components['hand-tracking-controls'].indexTipPosition);
      if (distance < this.data.pressDistance) {
        if (!this.pressed) { this.el.emit('pressedstarted'); }
        this.pressed = true;
        return;
      }
    }
    if (this.pressed) { this.el.emit('pressedended'); }
    this.pressed = false;
  },

  calculateFingerDistance: function (fingerPosition) {
    let el = this.el;
    let worldPosition = this.worldPosition;

    worldPosition.copy(el.object3D.position);
    el.object3D.parent.updateMatrixWorld();
    el.object3D.parent.localToWorld(worldPosition);

    return worldPosition.distanceTo(fingerPosition);
  }
});
