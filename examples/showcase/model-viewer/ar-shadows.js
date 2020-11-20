/* global AFRAME, THREE */
AFRAME.registerComponent('ar-shadows', {
  // Swap an object's material to a transparent shadows-only material while
  // in AR mode. Intended for use with a ground plane. The object is also
  // set visible while in AR mode, this is useful if it's hidden in other
  // modes due to them using a 3D environment.
  schema: {
    opacity: {default: 0.3}
  },
  init: function () {
    this.el.sceneEl.addEventListener('enter-vr', (ev) => {
      this.wasVisible = this.el.getAttribute('visible');
      if (this.el.sceneEl.is('ar-mode')) {
        this.savedMaterial = this.el.object3D.children[0].material;
        this.el.object3D.children[0].material = new THREE.ShadowMaterial();
        this.el.object3D.children[0].material.opacity = this.data.opacity;
        this.el.setAttribute('visible', true);
      }
    });
    this.el.sceneEl.addEventListener('exit-vr', (ev) => {
      if (this.savedMaterial) {
        this.el.object3D.children[0].material = this.savedMaterial;
        this.savedMaterial = null;
      }
      if (!this.wasVisible) this.el.setAttribute('visible', false);
    });
  }
});
