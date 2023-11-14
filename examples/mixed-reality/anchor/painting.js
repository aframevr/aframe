/* global AFRAME, THREE */
AFRAME.registerComponent('painting', {
  schema: {src: {type: 'map'}},
  init: function () {
    this.updateSrc = this.updateSrc.bind(this);
    this.el.addEventListener('model-loaded', this.updateSrc);
  },

  update: function () {
    if (this.data.src) { this.updateSrc(); }
  },

  updateSrc: function () {
    var el = this.el;
    var src = this.data.src;
    var self = this;
    if (!el.components['gltf-model'].model || !this.data.src) { return; }
    el.sceneEl.systems.material.loadTexture(src, {src: src}, function textureLoaded (texture) {
      var gltf = self.el.getObject3D('mesh');
      var gltfMaterial = gltf.children[0].children[0].children[0].children[0].children[0].material;
      texture.colorSpace = THREE.SRGBColorSpace;
      self.el.sceneEl.renderer.initTexture(texture);
      self.texture = texture;
      gltfMaterial.map = texture;
      gltfMaterial.needsUpdate = true;
    });
  }
});
