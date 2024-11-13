/* global AFRAME, THREE */
AFRAME.registerComponent('hide-model-parts', {
  schema: {
    parts: {type: 'array'}
  },

  update: function () {
    this.hideParts = this.hideParts.bind(this);
    this.el.addEventListener('model-loaded', this.hideParts);
  },

  hideParts: function () {
    var part;
    var parts = this.data.parts;
    var model = this.el.getObject3D('mesh');
    for (var i = 0; i < parts.length; i++) {
      part = model.getObjectByName(parts[i]);
      part.parent.remove(part);
    }
  },

  /**
   * Search for the part name and look for a mesh.
   */
  selectFromModel: function (model) {
    var mesh;
    var part;
    part = model.getObjectByName(this.data.part);
    if (!part) {
      console.error('[gltf-part] `' + this.data.part + '` not found in model.');
      return;
    }

    mesh = part.getObjectByProperty('type', 'Mesh').clone(true);

    if (this.data.buffer) {
      mesh.geometry = mesh.geometry.toNonIndexed();
      return mesh;
    }
    mesh.geometry = new THREE.Geometry().fromBufferGeometry(mesh.geometry);
    return mesh;
  }
});
