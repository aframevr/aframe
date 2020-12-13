let component = require('../core/component');
let THREE = require('../lib/three');
let bind = require('../utils/bind');
let registerComponent = component.registerComponent;

/**
 * Shadow component.
 *
 * When applied to an entity, that entity's geometry and any descendants will cast or receive
 * shadows as specified by the `cast` and `receive` properties.
 */
module.exports.Component = registerComponent('shadow', {
  schema: {
    cast: {default: true},
    receive: {default: true}
  },

  init: function () {
    this.onMeshChanged = bind(this.update, this);
    this.el.addEventListener('object3dset', this.onMeshChanged);
    this.system.setShadowMapEnabled(true);
  },

  update: function () {
    let data = this.data;
    this.updateDescendants(data.cast, data.receive);
  },

  remove: function () {
    let el = this.el;
    el.removeEventListener('object3dset', this.onMeshChanged);
    this.updateDescendants(false, false);
  },

  updateDescendants: function (cast, receive) {
    let sceneEl = this.el.sceneEl;
    this.el.object3D.traverse(function (node) {
      if (!(node instanceof THREE.Mesh)) { return; }

      node.castShadow = cast;
      node.receiveShadow = receive;

      // If scene has already rendered, materials must be updated.
      if (sceneEl.hasLoaded && node.material) {
        let materials = Array.isArray(node.material) ? node.material : [node.material];
        for (let i = 0; i < materials.length; i++) {
          materials[i].needsUpdate = true;
        }
      }
    });
  }
});
