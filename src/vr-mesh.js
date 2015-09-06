/* global VRObject */
/* exported VRMesh */

var VRMesh = document.registerElement(
  'vr-mesh',
  {
    prototype: Object.create(
      VRObject.prototype, {
        onElementCreated: {
          value: function() {
            var geometry = this.getGeometry();
            var material = this.getMaterial();
            this.object3D = new THREE.Mesh(geometry, material);
            this.load();
          }
        },

        onAttributeChanged: {
          value: function() {
            var material = this.getMaterial();
            if (material) {
              this.object3D.material = material;
            }
            this.object3D.geometry = this.getGeometry();
          }
        },

        getGeometry: {
          value: function() {
            var geometryId = this.getAttribute('geometry');
            var geometryEl = geometryId? document.querySelector('#' + geometryId) : undefined;
            return (geometryEl && geometryEl.geometry) || new THREE.BoxGeometry( 200, 200, 200 );
          }
        },

        getMaterial: {
          value: function() {
            var materialId = this.getAttribute('material');
            var materialEl = materialId? document.querySelector('#' + materialId) : undefined;
            return materialEl && materialEl.material;
          }
        }
      }
    )
  }
);